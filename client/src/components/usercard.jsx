import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Carousel } from 'flowbite-react';
import axiosStuff from "services/axiosstuff";
import { getDistance} from 'geolib';
import { Socket } from 'socket.io-client';
import moment from "moment/moment";
import axios from "axios";

function useUsercard() {
	const { user } = useParams();
	const [username, setUsername] = useState(user)

	const [getId, setId] = useState('');
	const [location, setLocation] = useState('');
	const [coordinates, setCoordinates] = useState(null);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [age, setAge] = useState('');
	const [gender, setGender] = useState('');
	const [seeking, setSeeking] = useState('');
	const [tags, setTags] = useState('');
	const [bio, setBio] = useState('');
	const [fame, setFame] = useState('');
	const [online, setOnline] = useState('');
	const [isOnline, setIsOnline] = useState('')

	const [userCoords, setUserCoords] = useState(null);
	const [liked, setLiked] = useState([])
	const [images2, setImages2] = useState([]);

	axios.defaults.withCredentials = true // For the sessions the work

	useEffect(() => {
		setUsername(user)
	}, [user])

	useEffect(() => {
		axiosStuff
		.getLiked().then((response) => {
			setLiked(response.rows)
		})
	}, [])

	useEffect(() => {
		axiosStuff
		.getUser(username)
		.then((response) => {
			if (response.realUser === false) {
				window.location.replace('/browse');
			}
			// console.log('userCARD', response)
			setId(response.user_id);
			setLocation(response.location)
			setCoordinates(response.coordinates);
			setFirstName(response.firstname);
			setLastName(response.lastname);
			setAge(response.age);
			setGender(response.gender);
			setSeeking(response.seeking);
			setTags(response.tags);
			setBio(response.bio);
			setFame(response.fame);
			setOnline(response.online);
			setIsOnline(response.isonline)
		})
	}, [username])

	useEffect(() => {
		axiosStuff
		.getUserCoords().then((response) => {
			// console.log('coords', response.coordinates)
			setUserCoords(response.coordinates);
		})
	}, [])

	useEffect(() => {
    axiosStuff.getImages().then((response) => {
      setImages2(response.rows);
      // console.log("images2", response);
    });
  }, []);

	return {
		username, getId, location, coordinates, firstName, lastName,
		age, gender, seeking, tags, bio, fame, online, isOnline,
		userCoords, liked, images2
	}
}

// const UserCard = ( {username }) => {
function UserCard(props) {
	const { socket, itsMe } = props;
	const hook = useUsercard(socket, itsMe);
	const {	username, getId, location, coordinates, firstName, lastName,
		age, gender, seeking, tags, bio, fame, online, isOnline,
		userCoords, liked, images2	} = hook;


	const calculateDistance = () => {
		if (coordinates && userCoords) {
			const dis = getDistance(
				{ latitude: userCoords.y, longitude: userCoords.x},
				{ latitude: coordinates.y, longitude: coordinates.x },
			);
			return (`Distance: ${Math.floor(dis / 1000)} KM`)
		}
		return ('Loading...')
	}

	// console.log('GEEET', getId)

	const toLiked = async () => {
	 	// console.log('ONBUTTON CLICK', getId, itsMe.username, username, itsMe.id)
		const notifContent = {
			room: getId,
			content: `${itsMe.username} liked you!`
		}
		const matchContent = {
			room: getId,
			content: `IT'S A MATCH WITH ${itsMe.username}!`
		}
		const myContent = {
			room: itsMe.id,
			content: `IT'S A MATCH WITH ${username}!`
		}
		const notifToDB = {
			sender_id: itsMe.id,
			to_id: getId,
			message: `${itsMe.username} liked you!`
		}
		const likeId = {
			user_id: itsMe.id,
			match_id: getId,
		}
		if (!isOnline) {
			axiosStuff
			.addNotification(notifToDB)
		}
		// .then((response) => {
		// })
		axiosStuff
		.addLiked(likeId).then(async (response) => {
			// console.log('addLiked', response)
			if (response.itsamatch === true) {
				await socket.emit('send_notification', matchContent);
				await socket.emit('send_notification', myContent);
				 if (response.itsamatch)
					window.location.replace('/matches');
				// console.log('TAMAMAMAMAMAMAMA', response.itsamatch)
			}
			else {
				await socket.emit('send_notification', notifContent);
				window.location.replace('/browse')
			}
		})
	}

	const toPassed = () => {
		const passId = {
			user_id: itsMe.id,
			passed_id: getId
		}
		axiosStuff
		.addPassed(passId)
		 .then(() => {
		//	 console.log('addPassed', response)
			window.location.replace('/browse')
		 })
	}

	const userImages2 = images2.length ? images2.filter(image =>
		image.user_id === getId) : []

	let tagsString = [];
	if (tags)
		tagsString = tags.join(', #');

	return(
    <section className="flex-grow py-10 bg-orange-200">
		<div className="container px-4 py-10 mx-auto">
		<div className="flex flex-wrap justify-center -mx-4">
			<div className="w-full px-4 lg:w-1/2">
				<div className="flex h-full flex-col rounded-2xl border-[3px] border-indigo-900 bg-white shadow-md">
					<div className="flex flex-wrap items-center justify-between px-6 py-12 border-indigo-900 lg:px-12">
						<div className="w-full mb-4 sm:mb-0 sm:w-1/2">
							<h2 className="text-2xl font-extrabold">{username}</h2>
							<p className="text-lg font-extrabold leading-7">
								{location}
							</p>
							<p className="text-lg font-extrabold leading-7">
								{calculateDistance()}
							</p>
							<p className="text-lg font-extrabold leading-7">
								Online: {isOnline === 1 ? 'NOW!' : `${moment(online).format('HH:mm YYYY-MM-DD ')}`}
							</p>
						</div>
					</div>

					<div className="items-center justify-center w-full px-8 pb-8">
					<div className="h-128 ml-6 block w-2/3 rounded-2xl border-[3px] border-indigo-900 shadow-lg sm:h-64 xl:h-80 2xl:h-96">
            <Carousel slide={false}>
              {userImages2.map((image) => (
                <img
                  className="block object-fit h-128 rounded-2xl sm:h-64 xl:h-80 2xl:h-96"
                  src={image.path}
                  alt={image.name}
                  key={image.id}
                />
              ))}
            </Carousel>
          </div> <br />
							<div>Fame: {fame}/50</div>
							<div>Firstname: {firstName}</div>
							<div>Lastname: {lastName}</div>
							<div>Age: {age}</div>
							<div>Gender: {gender}</div>
							<div>Seeking: {seeking}</div>
							<div>Tags: #{tagsString}</div>
							<div>Bio: {bio}</div>
					</div>
			{!liked.map(ii => ii.user_id).includes(getId) ?
					<div className="px-6 py-10 lg:px-12">
						{itsMe.status === 3 ? (
							<button
							type="button" onClick={toLiked}
							// className="inline-block w-full rounded border-[3px] border-indigo-900 bg-indigo-800 py-4 px-6 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-indigo-900"
							className="inline-block w-full px-6 py-4 text-lg font-extrabold leading-6 text-center text-white transition duration-200 bg-green-500 border border-green-600 rounded shadow border-3px hover:bg-green-600"
						>
							Match
						</button>
						) : (null)}
					<div className="pt-4" />
					<button
						type="button" onClick={toPassed}
						className="inline-block w-full rounded border-[3px] border-indigo-900 bg-indigo-800 py-4 px-6 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-indigo-900"
					>
						Pass
					</button>
				</div>
					:
					null
			}
				</div>
			</div>
		</div>
	</div>
	</section>
	)
}

UserCard.propTypes = {
	socket: PropTypes.instanceOf(Socket),
	itsMe: PropTypes.shape({
		id: PropTypes.number,
		username: PropTypes.string,
		firstname: PropTypes.string,
		lastname: PropTypes.string,
		email: PropTypes.string,
		password: PropTypes.string,
		verifycode: PropTypes.string,
		status: PropTypes.number,
		online: PropTypes.string
	})
}

UserCard.defaultProps = {
	socket: '',
	itsMe: {}
}
export default UserCard;

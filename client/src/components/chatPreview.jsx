import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axiosStuff from 'services/axiosstuff';
import { getDistance } from 'geolib';
import { Carousel } from 'flowbite-react';
import axios from 'axios';
// import io from 'socket.io-client';
import moment from 'moment/moment';

function useChatPreview(itsMe, userId, username) {
	const [location, setLocation] = useState('');
	const [coordinates, setCoordinates] = useState(null);
	const [age, setAge] = useState('');
	const [online, setOnline] = useState('');
	const [isOnline, setIsOnline] = useState('');
	const [blocked, setBlocked] = useState([]);
	const [matchStatus, setMatchStatus] = useState('');
	const [startChat, setStartChat] = useState(false);

	const [images2, setImages2] = useState([]);

	axios.defaults.withCredentials = true;

	useEffect(() => {
		axiosStuff
		.getMatchedUser(username).then((response) => {
			if (response.realUser === false) {
				window.location.replace('/browse')
			}
			setLocation(response.location)
			setCoordinates(response.coordinates);
			setAge(response.age);
			setOnline(response.online);
			setIsOnline(response.isonline)
		})
	}, [username])

	useEffect(() => {
		if (userId) {
			axiosStuff
			.getMatchStatus(userId).then((response) => {
				setMatchStatus(response.rows[0].status)
			})
		}
	}, [userId])

	useEffect(() => {
		axiosStuff
		.getMatchBlock().then((response) => {
			setBlocked(response.rows.map(blk => blk.block_id))
		})
	}, [])

	useEffect(() => {
    axiosStuff.getImages().then((response) => {
      setImages2(response.rows);
      // console.log("images2", response);
    });
  }, []);

	return {
		location, coordinates, age, online, isOnline, blocked, matchStatus,
		startChat, setStartChat, images2
	}

}

function ChatPreview({ itsMe, userId, username, firstname, lastname, loggedCoords }) {
	const hook = useChatPreview(itsMe, userId, username, firstname, lastname, loggedCoords);
	const { location, coordinates, age, online, isOnline, blocked,
		 matchStatus, startChat, setStartChat, images2 } = hook;

	const toChat = () => {
		setStartChat(true);
		window.location.replace(`/match/${username}`);
	}

	const calculateDistance = () => {
		if (coordinates && loggedCoords) {
			const dis = getDistance(
				{ latitude: loggedCoords.y, longitude: loggedCoords.x},
				{ latitude: coordinates.y, longitude: coordinates.x}
			);
			return (`Distance: ${Math.floor(dis / 1000)} KM`)
		}
		return ('Loading...')
	}

	const userImages2 = images2.length ? images2.filter(image =>
		image.user_id === userId) : []

		const toMatchProfile = async () => {
			window.location.href =`/match/${username}`

		}


	return (
	<div className="w-full px-4 mb-8 parent-div md:w-1/2 lg:w-1/4">
		{!startChat ? (
				<div className="mx-auto flex h-full max-w-md flex-col rounded-2xl border-[3px] border-indigo-900 bg-white px-6 py-12 shadow md:p-12">
				<h2 className="mb-2 text-xl font-extrabold">
					{`${username}, ${age}`}
				</h2>
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
          </div>
					<button type='button' onClick={toMatchProfile}>
						to profile
					</button>
				<h2 className="mb-2 text-xl font-extrabold">
					{firstname}
					<span className="block">{lastname}</span>
				</h2>
				<span className="block mb-8 font-bold leading-6 text-indigo-300">
					{`${location} ${calculateDistance()}`}
				</span>
				<p className="max-w-xs text-sm font-extrabold leading-5">
					Online: {isOnline === 1 ? 'NOW!' : `${moment(online).format('HH:mm YYYY-MM-DD ')}`}

				</p>
					<br />
				{
					!blocked.includes(userId) && itsMe.status === 3 && matchStatus === 3 ?
					<button type="button"
						className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
						 onClick={toChat}
					>
						Send message
					</button>
					:
						null
					}
			</div>
		) : (
			window.location.replace(`/match/${username}`)
		)}

	</div>
	)
}



ChatPreview.propTypes = {
	userId: PropTypes.number,
	username: PropTypes.string,
	firstname: PropTypes.string,
	lastname: PropTypes.string,
	coordinates: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired
	}),
	loggedCoords: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired
	}),
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

ChatPreview.defaultProps = {
	userId: '',
	username: '',
	firstname: '',
	lastname: '',
	coordinates: { x: 0, y: 0 },
	loggedCoords: { x: 0, y: 0 },
	itsMe: {}
}

export default ChatPreview;

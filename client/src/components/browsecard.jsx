import PropTypes from 'prop-types';
import axios from 'axios'
import { Socket } from 'socket.io-client';
import axiosStuff from 'services/axiosstuff';
import { getDistance } from 'geolib';
import moment from 'moment/moment';
import { Carousel } from 'flowbite-react';

function BrowseCard(props) {
	const { itsMe, socket, userId, username, location, gender,
		coordinates, loggedCoords, age, fame, tags, online,
		isonline, images2 } = props;

	axios.defaults.withCredentials = true // For the sessions the work

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

	const toLiked = async () => {
		const notifContent = {
			room: userId,
			content: `${itsMe.username} liked you!`
		}
		const matchContent = {
			room: userId,
			content: `IT'S A MATCH WITH ${itsMe.username}!`
		}
		const myContent = {
			room: itsMe.id,
			content: `IT'S A MATCH WITH ${username}!`
		}
		const notifToDB = {
			sender_id: itsMe.id,
			to_id: userId,
			message: `${itsMe.username} liked you!`
		}
		const likeId = {
			user_id: itsMe.id,
			match_id: userId
		}
		if (!isonline) {
			await axiosStuff
			.addNotification(notifToDB)
		}

		// .then((response) => {
		//	console.log('addLiked', response)
		// })
		axiosStuff
		.addLiked(likeId).then(async (response) => {
			// console.log('addLiked', response)
			if (response.itsamatch === true) {
				await socket.emit('send_notification', matchContent);
				await socket.emit('send_notification', myContent);
				if (response.itsamatch)
					window.location.replace('/matches')
			}
			else {
				await socket.emit('send_notification', notifContent);
				window.location.replace('/browse')
				// document.querySelector('#card').remove()
			}
		})
	}

	const toPassed = () => {
		const passId = {
			user_id: itsMe.id,
			passed_id: userId
		}
		axiosStuff
		.addPassed(passId)
		 .then(() => {
			// console.log('addPassed', response)
			 window.location.reload()
		 })
	}

	const toProfile = async () => {
		 const notifContent = {
			room: userId,
			content: `${itsMe.username} looked your profile!`
		 }
		 const addIds = {
			user_id: itsMe.id,
			stalked_id: userId
		 }
		 const notifToDB = {
			sender_id: itsMe.id,
			to_id: userId,
			message: `${itsMe.username} liked you!`
		 }
		 await axiosStuff
		 .addStalker(addIds)
		// .then((response2) => {
		//	console.log('addingstalkers', response2)
		// })
		 await axiosStuff
		 .addNotification(notifToDB)
		// .then((response) => {
		//		console.log('added notification to database', response)
		// })
		await socket.emit('send_notification', notifContent);
		await axiosStuff
		.getUser(username)
		// .then((response) => {
		//	console.log('RESP FROM THE BACK', response.username);
		//	// window.location.href =`/profile/${username}`
		// })
		window.location.href =`/profile/${username}`
	}

	let tagsString = [];
	if (tags)
		tagsString = tags.join(', #');

	// console.log('taa', images2)

	// const userImages2 = Object.values(images2).filter(image => image.user_id === userId);
	//  console.log('userImages2', userImages2)
	const userImages2 = images2.length ? images2.filter(image =>
		image.user_id === userId) : []

	return (
		<div className="container px-4 py-10 mx-auto">
		<div className="flex flex-wrap justify-center -mx-4" id='card'>
			<div className="w-full px-4 lg:w-1/2" >
				<div className="flex h-full flex-col rounded-2xl border-[3px] border-indigo-900 bg-white shadow-md">
					<div className="flex flex-wrap items-center justify-between px-4 py-6 border-indigo-900 lg:px-12">
						<div className="w-full pl-2 mb-2 sm:mb-0 ">
							<h2 className="pb-3 text-2xl font-semibold text-indigo-800 hover:text-green-500">
								{/* Username: */} {username}
							</h2>
							<p className="text-lg font-semibold leading-7 text-green-500 hover:text-indigo-800">
								Age:{age}
							</p>
						</div>
					</div>
	{/* IMAGEES */}
					<div className="items-center justify-center w-full px-8 pb-8">
						<div className="max-w-lg h-128 sm:h-64 xl:h-80 2xl:h-96 rounded-2xl">
							<Carousel slide={false}>
								{userImages2.map((image) => (
									<img
										// className="border-[3px] border-indigo-900 max-w-lg h-auto rounded-2xl"
										className="border-[3px] border-indigo-900 max-w-lg h-full rounded-2xl"
										src={image.path}
										alt={image.name} key={image.id}
										// style={{ objectFit: 'scale-down' }}
									/>
								))}
							</Carousel>
						</div>
					</div>
					<button type='button' onClick={toProfile}>to profile</button>

					<div className="flex flex-wrap items-center justify-between px-4 py-6 border-indigo-900 lg:px-12">
							<div className="w-full pl-2 mb-2 sm:mb-0 ">
								{/* <h2 className="pb-3 text-xl font-semibold text-indigo-800 hover:text-green-500">
									Username: {username}
								</h2> */}
								<p className="text-lg font-semibold leading-7 text-green-500 hover:text-indigo-800">
									Gender: {gender}
								</p>
								<p className="text-lg font-semibold leading-7 text-green-500 hover:text-indigo-800">
									Location: {location}
								</p>
								<p className="text-lg font-semibold leading-7 text-green-500 hover:text-indigo-800">
									{calculateDistance()}
								</p>
								<p className="text-lg font-semibold leading-7 text-green-500 hover:text-indigo-800">
									Tags: #{tagsString}
								</p>
								<p className="text-lg font-semibold leading-7 text-green-500 hover:text-indigo-800">
									Fame: {fame}
								</p>
								<p className="text-lg font-semibold leading-7 text-green-500 hover:text-indigo-800">
								Online: {isonline === 1 ? 'NOW!' : `${moment(online).format('HH:mm YYYY-MM-DD ')}`}
							</p>
							</div>
					</div>

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
							className="inline-block w-full px-6 py-4 text-lg font-extrabold leading-6 text-center text-white transition duration-200 bg-indigo-800 border-indigo-900 rounded shadow border-3px hover:bg-indigo-900"
						>
							Pass
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	)
}

BrowseCard.propTypes = {
	userId: PropTypes.number,
	username: PropTypes.string,
	location: PropTypes.string,
	gender: PropTypes.string,
	coordinates: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired
	}),
	loggedCoords: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired
	}),
	socket: PropTypes.instanceOf(Socket),
	age: PropTypes.number,
	fame: PropTypes.number,
	tags: PropTypes.arrayOf(PropTypes.string),
	online: PropTypes.string,
	isonline: PropTypes.number,
	itsMe: PropTypes.shape({
		id: PropTypes.number,
		username: PropTypes.string,
		firstname: PropTypes.string,
		lastname: PropTypes.string,
		email: PropTypes.string,
		password: PropTypes.string,
		verifycode: PropTypes.string,
		status: PropTypes.number,
		online: PropTypes.string,
	}),
	images2: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.number.isRequired,
		user_id: PropTypes.number.isRequired,
		path: PropTypes.string.isRequired
	})),
}

BrowseCard.defaultProps = {
	userId: '',
	username: '',
	location: '',
	gender: '',
	coordinates: { x: 0, y: 0 },
	loggedCoords: { x: 0, y: 0 },
	socket: '',
	age: '',
	fame: '',
	tags: [],
	online: '',
	isonline: '',
	itsMe: {},
	images2: []

}

BrowseCard.propTypes = {
}

BrowseCard.defaultProps = {
}

export default BrowseCard;

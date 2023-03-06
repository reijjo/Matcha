import PropTypes from 'prop-types';
import axiosStuff from 'services/axiosstuff';
import { getDistance } from 'geolib';
import { Carousel } from 'flowbite-react';
import moment from 'moment/moment';

function MatchPreview({ images2, itsMe, userId, username, firstname, lastname, location, age, coordinates, loggedCoords, bio, online, isonline}) {

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

	const toMatchProfile = async () => {
		const matches = {
			user_id: itsMe.id,
			match_id: userId,
			stalked_id: userId
		}
		// console.log('matches', matches)
	 await axiosStuff
		.addMatchTable(matches)
		// .then((response) => {
		//	console.log(response.rows)
		// })
		await axiosStuff
		.addStalker(matches)
		// .then((response2) => {
		//	console.log('addingstalkers', response2)
		// })
		await axiosStuff
		.getMatchedUser(username)
		// .then((response) => {
		//	console.log('respGETMATCHEDUSER', response.rows);
		// })
		// console.log('MATCHID', userId)
		window.location.href =`/match/${username}`
		// console.log(`taalla hihuu, ${username}`)
	}

	const userImages2 = images2.length ? images2.filter(image =>
		image.user_id === userId) : []

	return (
	<div className="w-full px-4 mb-8 md:w-1/2 lg:w-1/4">
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
			Online: {isonline === 1 ? 'NOW!' : `${moment(online).format('HH:mm YYYY-MM-DD ')}`}

			</p>
			<p className="max-w-xs text-sm font-extrabold leading-5">
				{bio}
			</p>
		</div>
	</div>
	)
}



MatchPreview.propTypes = {
	userId: PropTypes.number,
	username: PropTypes.string,
	firstname: PropTypes.string,
	lastname: PropTypes.string,
	location: PropTypes.string,
	age: PropTypes.number,
	coordinates: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired
	}),
	loggedCoords: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired
	}),
	bio: PropTypes.string,
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
		online: PropTypes.string
	}),
	images2: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.number.isRequired,
		user_id: PropTypes.number.isRequired,
		path: PropTypes.string.isRequired
	})),
}

MatchPreview.defaultProps = {
	userId: '',
	username: '',
	firstname: '',
	lastname: '',
	location: '',
	age: '',
	coordinates: { x: 0, y: 0 },
	loggedCoords: { x: 0, y: 0 },
	bio: '',
	online: '',
	isonline: '',
	itsMe: {},
	images2: []
}

export default MatchPreview;

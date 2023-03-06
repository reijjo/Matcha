import { useState, useEffect } from "react";
import axios from 'axios';
import PropTypes from 'prop-types';
import { getDistance} from 'geolib';
import { Socket } from 'socket.io-client';
// import { Pagination } from "react-paginate";
import axiosStuff from "../services/axiosstuff";
import BrowseCard from "./browsecard";

function useBrowse() {
  const [allUsers, setAllUsers] = useState([]);
	const [seeking, setSeeking] = useState('');
	const [userCoords, setUserCoords] = useState(null)
	const [myTags, setMyTags] = useState(null)
  const [passed, setPassed] = useState([]);
	const [matched, setMatched] = useState([]);
	const [myFilter, setMyFilter] = useState(null);
	const [tagsOn, setTagsOn] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);

	const [images2, setImages2] = useState([]);

	axios.defaults.withCredentials = true;

	useEffect(() => {
		axiosStuff
		.profileEdit().then((response2) => {
			// console.log('resp2', response2.tags)
			setSeeking(response2.seeking);
			setMyTags(response2.tags)
		})
			axiosStuff
			.browse()
			.then((response) => {
				// console.log('USERS', response.rows)
				setAllUsers(response.rows);
				// setUsername(response.rows.username)
			})
		}, [])

		useEffect(() => {
		 axiosStuff
		 .getUserCoords().then((response) => {
			setUserCoords(response.coordinates)
			})
		}, [])

		 useEffect(() => {
			axiosStuff
			.getPassed().then((response) => {
				setPassed(response.rows)
			})
			axiosStuff
			.getLiked().then((response) => {
				// console.log('matchiii', response.rows);
				setMatched(response.rows);
			})
		 }, [])

		const passedFilter = passed.map(passusers =>
		passusers.passed_id)

		const matchedFilter = matched.map(matchusers =>
			matchusers.user_id);

		// console.log('matchfiltefi', matchedFilter)

		const sortByDistance = (event) => {
			setMyFilter(event.target.value);
		}

		const sortByAge = (event) => {
			setMyFilter(event.target.value)
		}

		const sortByFame = (event) => {
			setMyFilter(event.target.value)
		}

		const sortByTags = (event) => {
			setMyFilter(event.target.value)
		}

		// console.log('MINAMINA', allUsers.map(users => users.age).sort())

		const handleTags = (event) => {
			setTagsOn(event.target.checked);
		}

		let genderFilter = allUsers.filter(users =>
		(seeking === 'Both' ? allUsers : users.gender === seeking)
		).filter(users => !passedFilter.includes(users.user_id)
		).filter(users => !matchedFilter.includes(users.user_id))

		if (userCoords && allUsers) {
			if (myFilter === 'Location') {
				genderFilter.sort((userA, userB) =>
				getDistance(
					{ latitude: userCoords.y, longitude: userCoords.x},
					{ latitude: userA.coordinates.y, longitude: userA.coordinates.x}
				) -
				getDistance(
					{ latitude: userCoords.y, longitude: userCoords.x},
					{ latitude: userB.coordinates.y, longitude: userB.coordinates.x}
				)
			)}
			else if (myFilter === 'Age') {
				genderFilter.sort((userA, userB) =>
				userA.age - userB.age)
			}
			else if (myFilter === 'Fame') {
				genderFilter.sort((userA, userB) =>
				userA.fame - userB.fame).reverse()
			}
			else if (myFilter === 'Tags') {
				const usersWithMatchingTags = genderFilter.filter(user => user.tags.some(tag => myTags.includes(tag)));
				usersWithMatchingTags.sort((userA, userB) => {
					const numMatchingTagsUserA = userA.tags.filter(tag => myTags.includes(tag)).length;
					const numMatchingTagsUserB = userB.tags.filter(tag => myTags.includes(tag)).length;
					return numMatchingTagsUserB - numMatchingTagsUserA;
				});
				const usersWithoutMatchingTags = genderFilter.filter(user => !usersWithMatchingTags.includes(user));
				genderFilter = usersWithMatchingTags.concat(usersWithoutMatchingTags);
			}

			else if (myFilter === 'filterAll') {
				const allFilter = genderFilter;
			// AGE
				const minAge = parseInt(document.getElementById('minAge').value, 10);
				const maxAge = parseInt(document.getElementById('maxAge').value, 10);
				// console.log('MINMAX', minAge, maxAge)
				// console.log('entasny',genderFilter.filter((user) =>
				// user.age >= minAge && user.age <= maxAge))

				const myAgeRange = allFilter.filter((user) => user.age >= minAge && user.age <= maxAge);
			// FAME
				const minFame = parseInt(document.getElementById('minFame').value, 10);
				const maxFame = parseInt(document.getElementById('maxFame').value, 10);

				const myFameRange = myAgeRange.filter((user) => user.fame >= minFame && user.fame <= maxFame);
			// TAGS
				const usersWithMatchingTags = myFameRange.filter(user => user.tags.some(tag => myTags.includes(tag)));
				usersWithMatchingTags.sort((userA, userB) => {
					const numMatchingTagsUserA = userA.tags.filter(tag => myTags.includes(tag)).length;
					const numMatchingTagsUserB = userB.tags.filter(tag => myTags.includes(tag)).length;
					return numMatchingTagsUserB - numMatchingTagsUserA;
				});
				const usersWithoutMatchingTags = myFameRange.filter(user => !usersWithMatchingTags.includes(user));
				// genderFilter = usersWithMatchingTags.concat(usersWithoutMatchingTags);

			// DIS
				const minDis = parseInt(document.getElementById('minDis').value, 10);
				const maxDis = parseInt(document.getElementById('maxDis').value, 10);
				// console.log('DISMINMAX', minDis, maxDis)
				const tagsOnButton = document.getElementById('tagsOn').checked;

				if (tagsOnButton && tagsOn) {
					const myDistanceRange = usersWithMatchingTags.filter((user) => {
						const distance = getDistance(
								{ latitude: userCoords.y, longitude: userCoords.x },
								{ latitude: user.coordinates.y, longitude: user.coordinates.x }
						);
						return (distance/1000 >= minDis && distance/1000 <= maxDis);
					});
					genderFilter = myDistanceRange
				}
				else {
					const myDistanceRange = usersWithoutMatchingTags.filter((user) => {
						const distance = getDistance(
								{ latitude: userCoords.y, longitude: userCoords.x },
								{ latitude: user.coordinates.y, longitude: user.coordinates.x }
						);
						return (distance/1000 >= minDis && distance/1000 <= maxDis);
					});
					genderFilter = myDistanceRange
				}
			}
			else {
				genderFilter.sort((userA, userB) =>
				getDistance(
					{ latitude: userCoords.y, longitude: userCoords.x},
					{ latitude: userA.coordinates.y, longitude: userA.coordinates.x}
				) -
				getDistance(
					{ latitude: userCoords.y, longitude: userCoords.x},
					{ latitude: userB.coordinates.y, longitude: userB.coordinates.x}
				)
			)}}

		const runAll = () => {
			setMyFilter('filterAll');
		}

		const usersPerPage = 5;
		const start = currentPage * usersPerPage;
		const end = start + usersPerPage;
		const paginatedUsers = genderFilter.slice(start, end);

		const handlePageclick = (data) => {
			setCurrentPage(data.selected);
		}

		useEffect(() => {
		 	axiosStuff.getImages().then((response) => {
		 		setImages2(response.rows);
		 	});
		  }, []);

		return {
			userCoords, sortByDistance, sortByAge, sortByFame,
			sortByTags, handleTags, genderFilter,	runAll,
			paginatedUsers, handlePageclick, images2
		}
}

function Browse({ loggedIn, itsMe, socket }) {
	const hook = useBrowse(loggedIn, itsMe, socket);
	const { userCoords, sortByDistance, sortByAge, sortByFame,
		sortByTags, handleTags, runAll,	paginatedUsers,
		images2 } = hook;

		if (!hook) {
			return (
				<p>Loading...</p>
			)
		}
	// if (!loggedIn)
	// 	window.location.replace('/')

  return (
    <section className="flex-grow py-10 bg-orange-200">
		{/* SORT BY */}
			<div style={{margin: '3vw'}}>
				<h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Sort By:</h3>
				<ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
				    <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
				        <div className="flex items-center pl-3">
				            <input id="horizontal-list-radio-license" type="radio" value="Location"
											name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											onChange={sortByDistance} defaultChecked
										/>
				            <label htmlFor="horizontal-list-radio-license" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Location</label>
				        </div>
				    </li>
						<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
				        <div className="flex items-center pl-3">
				            <input id="horizontal-list-radio-license" type="radio" value="Age"
											name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											onChange={sortByAge}
										/>
				            <label htmlFor="horizontal-list-radio-license" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Age</label>
				        </div>
				    </li>
						<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
				        <div className="flex items-center pl-3">
				            <input id="horizontal-list-radio-license" type="radio" value="Fame"
											name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											onChange={sortByFame}
										/>
				            <label htmlFor="horizontal-list-radio-license" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Fame </label>
				        </div>
				    </li>
						<li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
				        <div className="flex items-center pl-3">
				            <input id="horizontal-list-radio-license" type="radio" value="Tags"
											name="list-radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
											onChange={sortByTags}
										/>
				            <label htmlFor="horizontal-list-radio-license" className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Tags </label>
				        </div>
				    </li>
				</ul>
			</div>
		{/* FILTER BY */}
			<div style={{margin: '3vw'}}>
				<h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Filter By:</h3>
				<ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
				  <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
		{/* LOCATION */}
						<div className="flex items-center pl-3">
				  	  <label htmlFor="horizontal-list-radio-license"
								className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Distance
							</label>
							<input id="minDis" type="number" placeholder="min" defaultValue='0'
								className="w-24 h-6 ml-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
							/>
   						<input id="maxDis" type="number" placeholder="max" defaultValue='200000'
								className="w-24 h-6 ml-4 mr-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
							/>
   						{/* <button type='button' className="mr-4" onClick={runDistanceFilter}>Filter</button> */}
						</div>
			{/* AGE */}
						<div className="flex items-center pl-3">
				  	  <label htmlFor="horizontal-list-radio-license"
								className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Age
							</label>
							<input id="minAge" type="number" placeholder="min" min='16' defaultValue='16'
								className="w-24 h-6 ml-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
							/>
   						<input id="maxAge" type="number" placeholder="max" max='101' defaultValue='101'
								className="w-24 h-6 ml-4 mr-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
							/>
   						{/* <button type='button' className="mr-4" onClick={runAgeFilter}>Filter</button> */}
						</div>
		{/* FAME */}
						<div className="flex items-center pl-3">
				  	  <label htmlFor="horizontal-list-radio-license"
								className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Fame
							</label>
							<input id="minFame" type="number" placeholder="min" min='0' defaultValue='0'
								className="w-24 h-6 ml-2 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
							/>
   						<input id="maxFame" type="number" placeholder="max" max='50' defaultValue='50'
								className="w-24 h-6 ml-4 mr-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
							/>
   						{/* <button type='button' className="mr-4" onClick={runFameFilter}>Filter</button> */}
						</div>
		{/* TAGS */}
						<div className="flex items-center pl-3">
				  	  <label htmlFor="horizontal-list-radio-license"
								className="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Tags
							</label>
   						<input id="tagsOn" onChange={handleTags}
								type="checkbox"
								className="w-24 h-6 ml-4 mr-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
							/>
   						{/* <button type='button' className="mr-4" onClick={runTagsFilter}>Filter</button> */}
							<button type='button' className="mr-4" onClick={runAll}>Filter</button>
						</div>
				  </li>
				</ul>
			</div>
      {
       paginatedUsers.map(users =>
        <BrowseCard
					itsMe={itsMe}
          socket={socket}
          key={users.user_id}
          userId={users.user_id}
          location={users.location}
          username={users.username}
          gender={users.gender}
					coordinates={users.coordinates}
					loggedCoords={userCoords}
					age={users.age}
					fame={users.fame}
					tags={users.tags}
					online={users.online}
					isonline={users.isonline}
					images2={images2}
        />
       )
      }

    </section>

  );
}

 Browse.propTypes = {
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
	}),
	loggedIn: PropTypes.bool
 }

 Browse.defaultProps = {
  socket: '',
	itsMe: {},
	loggedIn: ''
 }

export default Browse;

  // const { socket, itsMe } = props
  // const [allUsers, setAllUsers] = useState([]);
  // // const [username, setUsername] = useState('');
	// const [seeking, setSeeking] = useState('');
	// const [userCoords, setUserCoords] = useState(null)
	// const [myTags, setMyTags] = useState(null)

  // const [passed, setPassed] = useState([]);
	// const [matched, setMatched] = useState([]);
	// const [myFilter, setMyFilter] = useState(null);
	// const [tagsOn, setTagsOn] = useState(false);

	// axios.defaults.withCredentials = true;

  // useEffect(() => {
	// axiosStuff
	// .profileEdit().then((response2) => {
	// 	// console.log('resp2', response2.tags)
	// 	setSeeking(response2.seeking);
	// 	setMyTags(response2.tags)
	// })
	//   axiosStuff
	//   .browse()
	//   .then((response) => {
	//   	// console.log('USERS', response.rows)
  //     setAllUsers(response.rows);
  //     // setUsername(response.rows.username)
	//   })
  // }, [])

	//  useEffect(() => {
	//  axiosStuff
	//  .getUserCoords().then((response) => {
	// 	setUserCoords(response.coordinates)
	// 	})
	//  }, [])

  //  useEffect(() => {
  //   axiosStuff
  //   .getPassed().then((response) => {
  //     setPassed(response.rows)
  //   })
	// 	axiosStuff
	// 	.getLiked().then((response) => {
	// 		// console.log('matchiii', response.rows);
	// 		setMatched(response.rows);
	// 	})
  //  }, [])

  // const passedFilter = passed.map(passusers =>
  // passusers.passed_id)

	// const matchedFilter = matched.map(matchusers =>
	// 	matchusers.user_id);

	// // console.log('matchfiltefi', matchedFilter)

	// const sortByDistance = (event) => {
	// 	setMyFilter(event.target.value);
	// }

	// const sortByAge = (event) => {
	// 	setMyFilter(event.target.value)
	// }

	// const sortByFame = (event) => {
	// 	setMyFilter(event.target.value)
	// }

	// const sortByTags = (event) => {
	// 	setMyFilter(event.target.value)
	// }

	// // console.log('MINAMINA', allUsers.map(users => users.age).sort())

	// const handleTags = (event) => {
	// 	setTagsOn(event.target.checked);
	// }


  // let genderFilter = allUsers.filter(users =>
	// (seeking === 'Both' ? allUsers : users.gender === seeking)
  // ).filter(users => !passedFilter.includes(users.user_id)
	// ).filter(users => !matchedFilter.includes(users.user_id))

	// if (userCoords && allUsers) {
	// 	if (myFilter === 'Location') {
	// 		genderFilter.sort((userA, userB) =>
  //     getDistance(
  //       { latitude: userCoords.y, longitude: userCoords.x},
  //       { latitude: userA.coordinates.y, longitude: userA.coordinates.x}
  //     ) -
  //     getDistance(
  //       { latitude: userCoords.y, longitude: userCoords.x},
  //       { latitude: userB.coordinates.y, longitude: userB.coordinates.x}
  //     )
  //   )}
	// 	else if (myFilter === 'Age') {
	// 		genderFilter.sort((userA, userB) =>
	// 		userA.age - userB.age)
	// 	}
	// 	else if (myFilter === 'Fame') {
	// 		genderFilter.sort((userA, userB) =>
	// 		userA.fame - userB.fame).reverse()
	// 	}
	// 	else if (myFilter === 'Tags') {
	// 		const usersWithMatchingTags = genderFilter.filter(user => user.tags.some(tag => myTags.includes(tag)));
	// 		usersWithMatchingTags.sort((userA, userB) => {
	// 			const numMatchingTagsUserA = userA.tags.filter(tag => myTags.includes(tag)).length;
	// 			const numMatchingTagsUserB = userB.tags.filter(tag => myTags.includes(tag)).length;
	// 			return numMatchingTagsUserB - numMatchingTagsUserA;
	// 		});
	// 		const usersWithoutMatchingTags = genderFilter.filter(user => !usersWithMatchingTags.includes(user));
	// 		genderFilter = usersWithMatchingTags.concat(usersWithoutMatchingTags);
	// 	}

	// 	else if (myFilter === 'filterAll') {
	// 		const allFilter = genderFilter;
	// 	// AGE
	// 		const minAge = parseInt(document.getElementById('minAge').value, 10);
	// 		const maxAge = parseInt(document.getElementById('maxAge').value, 10);
	// 		console.log('MINMAX', minAge, maxAge)
	// 		console.log('entasny',genderFilter.filter((user) =>
	// 		user.age >= minAge && user.age <= maxAge))

	// 		const myAgeRange = allFilter.filter((user) => user.age >= minAge && user.age <= maxAge);
	// 	// FAME
	// 		const minFame = parseInt(document.getElementById('minFame').value, 10);
	// 		const maxFame = parseInt(document.getElementById('maxFame').value, 10);

	// 		const myFameRange = myAgeRange.filter((user) => user.fame >= minFame && user.fame <= maxFame);
	// 	// TAGS
	// 		const usersWithMatchingTags = myFameRange.filter(user => user.tags.some(tag => myTags.includes(tag)));
	// 		usersWithMatchingTags.sort((userA, userB) => {
	// 			const numMatchingTagsUserA = userA.tags.filter(tag => myTags.includes(tag)).length;
	// 			const numMatchingTagsUserB = userB.tags.filter(tag => myTags.includes(tag)).length;
	// 			return numMatchingTagsUserB - numMatchingTagsUserA;
	// 		});
	// 		const usersWithoutMatchingTags = myFameRange.filter(user => !usersWithMatchingTags.includes(user));
	// 		// genderFilter = usersWithMatchingTags.concat(usersWithoutMatchingTags);

	// 	// DIS
	// 		const minDis = parseInt(document.getElementById('minDis').value, 10);
	// 		const maxDis = parseInt(document.getElementById('maxDis').value, 10);
	// 		console.log('DISMINMAX', minDis, maxDis)
	// 		const tagsOnButton = document.getElementById('tagsOn').checked;

	// 		if (tagsOnButton && tagsOn) {
	// 			const myDistanceRange = usersWithMatchingTags.filter((user) => {
	// 				const distance = getDistance(
	// 						{ latitude: userCoords.y, longitude: userCoords.x },
	// 						{ latitude: user.coordinates.y, longitude: user.coordinates.x }
	// 				);
	// 				return (distance/1000 >= minDis && distance/1000 <= maxDis);
	// 			});
	// 			genderFilter = myDistanceRange
	// 		}
	// 		else {
	// 			const myDistanceRange = usersWithoutMatchingTags.filter((user) => {
	// 				const distance = getDistance(
	// 						{ latitude: userCoords.y, longitude: userCoords.x },
	// 						{ latitude: user.coordinates.y, longitude: user.coordinates.x }
	// 				);
	// 				return (distance/1000 >= minDis && distance/1000 <= maxDis);
	// 			});
	// 			genderFilter = myDistanceRange
	// 		}
	// 	}
	// 	else {
	// 		genderFilter.sort((userA, userB) =>
  //     getDistance(
  //       { latitude: userCoords.y, longitude: userCoords.x},
  //       { latitude: userA.coordinates.y, longitude: userA.coordinates.x}
  //     ) -
  //     getDistance(
  //       { latitude: userCoords.y, longitude: userCoords.x},
  //       { latitude: userB.coordinates.y, longitude: userB.coordinates.x}
  //     )
  //   )}}

	// 	const runAll = () => {
	// 		setMyFilter('filterAll');
	// 	}

import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Carousel } from 'flowbite-react';
import axios from 'axios';
import axiosStuff from "services/axiosstuff";
import { getDistance} from 'geolib';
import shortid from "shortid";
import { Socket } from 'socket.io-client'
import moment from "moment/moment";
import InfoText from "./infoText";


function useMatchCard(itsMe, socket) {
	const { user } = useParams();
	const [username, setUsername] = useState(user);
	const [messageList, setMessageList] = useState([]);
	const [getId, setId] = useState(null);
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
	const [isOnline, setIsOnline] = useState('');
  const [allDataFromMessages, setAllDataFromMessages] = useState([]);
	const [myStatus, setMyStatus] = useState('');
	const [matchStatus, setMatchStatus] = useState('');
	const [userCoords, setUserCoords] = useState(null);
	const [blocked, setBlocked] = useState([]);
	const [matched, setMatched] = useState([]);
	const [reported, setReported] = useState([]);
  const [myBlockStatus, setMyBlockStatus] = useState([]);
	const [getMatches, setGetMatches] = useState([]);
	const [startChat, setStartChat] = useState(false);
	const [msg, setMsg] = useState('');
	const inputRef = useRef(null);

	const [message, setMessage] = useState(null);
	const [images2, setImages2] = useState([]);


	axios.defaults.withCredentials = true

	useEffect(() => {
		axiosStuff
		.getMatchedUser(username).then((response) => {
			if (response.realUser === false) {
				window.location.replace('/browse')
			}
			// console.log('matchCARD', response)
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
			setIsOnline(response.isonline);
		})
	}, [username, isOnline])

	useEffect(() => {
		if (socket) {
			socket.on('recieve_message', data => {
				setMessageList([...messageList, data])
				// console.log('DATA', data)
			})
		}
	})

	useEffect(() => {
		if (socket && getId) {
			socket.emit('join_room', getId)
		}
	}, [getId, socket])

	useEffect(() => {
		setUsername(user)
	}, [user])

	useEffect(() => {
		axiosStuff
		.getMessage().then((response) => {
			// console.log('HUUH', response)
			setAllDataFromMessages(response);
		})
	}, [])

	useEffect(() => {
		axiosStuff
		.getMyStatus().then((response) => {
			// console.log('MY STATUS', response.rows[0].status)
			setMyStatus(response.rows[0].status)
		})
	}, [])

	useEffect(() => {
		if (getId) {
			axiosStuff
			.getMatchStatus(getId).then((response) => {
				// console.log('MATCH STATUS', response.rows[0].status)
				setMatchStatus(response.rows[0].status)
			})
		}
	}, [getId])

	useEffect(() => {
		axiosStuff
		.getUserCoords().then((response) => {
			setUserCoords(response.coordinates);
		})
	}, [])

	useEffect(() => {
		axiosStuff
		.getMatchBlock().then((response) => {
			setBlocked(response.rows.map(blk => blk.block_id))
			setMatched(response.rows.map(mtch => mtch))
			setReported(response.rows.map(report => report.report_id))
		})
	}, [])

	useEffect(() => {
		axiosStuff
		.amiblocked().then((response) => {
			setMyBlockStatus(response.rows.map((users) => users.user_id))
		})
		axiosStuff
		.getMatchTable().then((response) => {
			setGetMatches(response.rows.map((users) => users.match_id))
		})
	}, [])

	useEffect(() => {
    axiosStuff.getImages().then((response) => {
      setImages2(response.rows);
    });
  }, []);

	return {
		username, messageList, setMessageList, getId, location, coordinates,
		firstName, lastName, age, gender, seeking, tags, bio, fame, online, isOnline,
		allDataFromMessages, myStatus, matchStatus, userCoords, blocked, myBlockStatus,
		getMatches, inputRef, startChat, setStartChat, msg, setMsg, matched, setMessage,
		message, images2, reported
	}
}

function MatchCard({ itsMe, socket }) {
	const hook = useMatchCard(itsMe, socket);

	const { username, messageList, setMessageList, getId, location, coordinates,
		firstName, lastName, age, gender, seeking, tags, bio, fame, online, isOnline,
		allDataFromMessages, myStatus, matchStatus, userCoords, blocked, myBlockStatus,
		getMatches, inputRef, startChat, setStartChat, msg, setMsg, matched, setMessage,
		message, images2, reported } = hook;

	const chatRoom = [itsMe.id, getId].sort().join('-');
	const resetInput = () => {
		inputRef.current.value = '';
	}

	const toChat = () => {
		setStartChat(true)
		socket.emit('join_room', chatRoom)
	}

	const sendMessage = async () => {
		axiosStuff.amiblocked().then((response) => {
			if (response.rowCount !== 0)
				window.location.replace('/browse')
		}).then(() => {
			axiosStuff.getMatchBlock().then((response) => {
				if (response.rows.report_id) {
					window.location.replace('/browse');
				}
			})
		})
		if (myBlockStatus.includes(getId)) {
			window.location.replace('/browse');
		}
		else if (!getMatches.includes(getId) || !matched) {
			window.location.replace('/browse');
		}


		const messageContent = {
			room: chatRoom,
			content: {
				author: itsMe.username,
				message: msg
			}
		}
		const notifContent = {
			room: getId,
			content: `New message from ${itsMe.username}`
		}
		const msgToDB = {
			sender_id: itsMe.id,
			to_id: getId,
			message: msg
		}
		const notifToDB = {
			sender_id: itsMe.id,
			to_id: getId,
			message: `New message from ${itsMe.username}`,
		}
		// console.log('HALOOO', msgToDB)
		axiosStuff
		.addMessage(msgToDB)
		.then((response) => {
			if (response.message) {
				setMessage(response.message)
			}
			setTimeout(() => {
				setMessage(null)
			}, 5000)
		 })
			axiosStuff
			.addNotification(notifToDB)


		await socket.emit('send_notification', notifContent)
		const regex = /^[a-zA-Z0-9 _.!@-]+$/;
		if ((messageContent.content.message.length > 0 && messageContent.content.message.length < 101)) {
			if (messageContent.content.message.match(regex)) {
				await socket.emit('send_message', messageContent)
				setMessageList([...messageList, messageContent.content])
				setMsg('');
				resetInput()
			}
			else {
				setMsg('');
				resetInput()
			}}
		else {
			// setMessage(`message length 1-100 characters and only letters a-z and A-Z and numbers 0-9 and ' _.!@- thanks.`);
			setMsg('');
			resetInput()
		}
	}

	// console.log('IDDD, USERRRR ISONLINE??', getId, isOnline)

	const removeUser = async () => {
		const removeId = {
			user_id: itsMe.id,
			remove_id: getId
		}
		const notifContent = {
			room: getId,
			content: `${itsMe.username} doesn't like you anymore.`
		}
		const notifToDB = {
			sender_id: itsMe.id,
			to_id: getId,
			message: `${itsMe.username} doesn't like you anymore.`
		}
		if (!isOnline) {
			await axiosStuff
			.addNotification(notifToDB)
		}
		// .then((response) => {
		// 	console.log('addNOTIIIF,', response)
		// })
		await axiosStuff
		.unLike(removeId)
		// .then((response) => {
		// 	console.log('DELETTEEEE', response)
		// })
		await socket.emit('send_notification', notifContent);
		// console.log(removeId, notifContent, notifToDB)
		window.location.replace('/matches')
	}

	const blockUser = () => {
		const blockId = {
			user_id: itsMe.id,
			block_id: getId
		}
		axiosStuff
		.blockUser(blockId)
		// .then((response) => {
			.then(() => {
				window.location.replace('/matches')
			})
	}

	const unblockUser = () => {
		const blockId = {
			user_id: itsMe.id,
			block_id: getId
		}
		axiosStuff
		.unblockUser(blockId)
		// .then((response) => {
			.then(() => {
			// console.log('blocked?', response)
			window.location.replace('/matches')
		})
	}

	const reportUser = () => {
		const reportId = {
			user_id: itsMe.id,
			block_id: getId
		}
		axiosStuff
		.reportUser(reportId)
		// .then((response) => {
			.then(() => {
				axiosStuff
				.unLike(reportId).then(() => {
					window.location.replace('/matches')
				})
		})
	}

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

	const userImages2 = images2.length ? images2.filter(image =>
		image.user_id === getId) : []

	let tagsString = [];
	if (tags)
		tagsString = tags.join(', #');

	return(
    <section className="flex-grow py-10 bg-orange-200">
		{/* BEFORE CHAT BUTTON  */}
			{!startChat ? (
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
									<div>Online: {isOnline === 1 ? 'NOW!' : `${moment(online).format('HH:mm YYYY-MM-DD ')}`}</div>
									{
										!blocked.includes(getId) && myStatus === 3 && matchStatus === 3 && !reported.includes(getId)?
									<button type="button"
										className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
										 onClick={toChat}
									>
										Start chatting
									</button>
									:
										null
									}

									<br /><br />
									<button type="button"
											className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
											onClick={removeUser}
										>
											Remove {username}
										</button> <br />
									<span>
										{
											blocked.includes(getId) ?
											<button type="button"
											className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
											onClick={unblockUser}
										>
											UNBLOCK {username}
										</button>
											:
											<button type="button"
											className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
											onClick={blockUser}
										>
											Block {username}
										</button>
										}
										<button type="button"
											className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
											onClick={reportUser}
										>
											Report {username}
										</button>
									</span>

							</div>

						</div>
					</div>
				</div>

			</div>
			) : (
	// AFTER CHAT BUTTON
	<div className="container px-4 py-10 mx-auto">
	<div className="flex flex-wrap items-center mb-16 -mx-4">
		<div className="w-full px-4 mb-8 lg:mb-0 lg:w-1/2">
			<div className="max-w-xl">
				<span className="text-lg font-extrabold text-orange-500">
					Get to know your match
				</span>
				<h1 className="mt-3 mb-3 text-3xl font-extrabold font-heading md:text-4xl">
					Stay connected with {username}
				</h1>
				<p className="text-xl font-extrabold leading-8">
					Start your conversation!
				</p>
				<a href="/browse">
					<button	type="button">Exit chat</button>
				</a>
			</div>
		</div>
		<div className="w-full px-4 lg:w-1/2" />
	</div>
	<div className="flex flex-wrap justify-center">
		{/* <div className="w-full px-4 mb-16 lg:mb-0 lg:w-1/2" /> */}
		<div className="w-full px-4 lg:w-1/2">
			<div className="mb-6 rounded-2xl border-[3px] border-indigo-900 bg-white px-6 py-12 text-center shadow-md md:px-12">
{/* MY OWN SHITTY HTML */}
				{/* <form className="text-left" action=""> */}
					<div className="w-full h-64 p-4 mb-8 overflow-y-scroll text-lg font-extrabold placeholder-indigo-900 border-2 border-indigo-900 rounded shadow resize-none chatContainer h-50">
			{/* MESSAGES FROM DATABASE  */}
					<div className="messages">
							{allDataFromMessages.filter(huhu => (huhu.sender_id === itsMe.id || huhu.to_id === itsMe.id) &&
								(huhu.sender_id === getId || huhu.to_id === getId))
								.map((dbvalue) =>
											<div className="messageContainer"
												id={dbvalue.sender_id === itsMe.id ? 'You' : 'Other'}
												key={shortid.generate()}
											>
											<div className="messageIndividual"
												key={dbvalue.id}
											>
												{dbvalue.sender_id === itsMe.id ? itsMe.username : username}: <div className="messageText">{dbvalue.message}</div>
											</div>
										</div>
								// )
							)}
						</div>
				{/* MESSAGES FROM CHAT  */}
						<div className="messages">
							{messageList.map((value) => (

								<div className="messageContainer"
									id={value.author === itsMe.username ? 'You' : 'Other'}
									key={shortid.generate()}
								>
									<div className="messageIndividual"
									>
										{value.author}: <div className="messageText">{value.message}</div>
									</div>

								</div>
							)
							)}
						</div>
					</div>

					<InfoText message={message} />

					<div className="mb-8 text-left messageInputs">
						<textarea
							className="w-full p-4 text-lg font-extrabold placeholder-indigo-900 border-2 border-indigo-900 rounded shadow resize-none"
							name=""
							id=""
							cols="30"
							rows="1"
							placeholder="Your message..."
							onChange={(event) => {
								setMsg(event.target.value)
							}}
							ref={inputRef}
						/>
						<button
							type="button"
							className="inline-block w-full rounded border-[3px] border-indigo-900 bg-indigo-800 py-4 px-6 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-indigo-900"
							onClick={sendMessage}
						 >
							Send
						</button>
					</div>

				{/* </form> */}
			</div>
		</div>
	</div>
</div>
			)}
	</section>
	)
}

MatchCard.propTypes = {
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

MatchCard.defaultProps = {
	socket: '',
	itsMe: {}
}
export default MatchCard;

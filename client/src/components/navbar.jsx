import { arrayOf, string, func, PropTypes } from 'prop-types';
import { Socket } from 'socket.io-client';
import { useState } from 'react';
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { Link } from 'react-router-dom';
import shortid from "shortid";
import axios from 'axios'
import axiosStuff from '../services/axiosstuff'
import noNotificationsImg from '../images/alert2.png' // brian
import notificationsImg from "../images/alert3.png"; // brian

function useNav() {
	const [loading, setLoading] = useState(true);

	return { loading, setLoading }
}

function Nav( props ) {
	const { itsMe, socket,
		notifications, setNotifications,
		dbNotifications, setDbNotifications } = props;
	const { loading, setLoading } = useNav();

	axios.defaults.withCredentials = true // For the sessions the work

		setTimeout(() => {
			setLoading(false)
		}, 1000)

	const imgSrc =
	 notifications.length > 0 ||
	 (dbNotifications && dbNotifications.length > 0)
		? notificationsImg
		: noNotificationsImg;		// brian

	 const clearNotification = (notification) => {
		const clear = notifications.filter((n) => n !== notification);
		setNotifications(clear)
	 }

	 const setAsRead = (notificationId) => {
		const seen = {
			notif_id: notificationId
		}
		axiosStuff
		.updateNotif(seen)
		// .then((response) => {
		//	if (response)
		//		console.log('Updated notification', response)
		//	const updatedNotifications = dbNotifications.filter(notification =>
		//		notification.id !== notificationId)
		//	setDbNotifications(updatedNotifications)
		// })
		.then(() => {
				const updatedNotifications = dbNotifications.filter(notification =>
					notification.id !== notificationId)
				setDbNotifications(updatedNotifications)
		})
	 }

	const logout = async () => {
		const logoutuser = {
			logoutuser: itsMe.username
		}
		await axiosStuff
		.logoutTime(logoutuser)
			.then(() => {
			// if (response)
			// 	console.log('LOGOUTTIME', response);
			socket.emit('disconnected', itsMe.id)
		})
		// setTimeout(() => {
			window.location.replace('/logout')
		// }, 2000)
	}

	if (loading) {
		return (
			// <div>Loading...</div>
				<div className="w-full p-2 md:w-auto">
					<h2 className="text-lg font-semibold text-coolGray-900">
						Loading...
					</h2>
				</div>
			)
	}

	return (
		<Navbar
			className="border-b-[3px] border-t-0 border-l-0 border-r-0 pt-5 pr-4 no-text-size-adjust"
			// expand={false}
			fluid
			style={{ backgroundColor: "#fcd9bd", borderColor: "#362f78" }}
		>
		<Navbar.Brand href="/">
			<img
				className="h-8 pl-1"
				src={require("../images/matchaLogo.png")}
				alt="Matcha"
				width="auto"
			/>
		 </Navbar.Brand>
		 {itsMe.username ?
			<div className="flex flex-row px-1 pt-0">
          <ul className="flex flex-row pt-2">
            <li>
              <Link
                className="pr-4 text-lg font-extrabold text-indigo-800 hover:text-green-500 2xl:mr-16"
                to="/browse"
              >
                Browse
              </Link>
            </li>
            <li>
              <Link
                className="pr-4 text-lg font-extrabold text-indigo-800 hover:text-green-500 2xl:mr-16"
                to="/matches"
              >
                Matches
              </Link>
            </li>
            <li>
              <Link
                className="pr-4 text-lg font-extrabold text-indigo-800 hover:text-green-500 2xl:mr-16"
                to="/chat"
              >
                Chat
              </Link>
            </li>
						<li>
							<button
           		// className="block h-12 w-32 rounded border-[3px] border-red-600 bg-red-500 px-6 py-2 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-red-600"
								className="pr-4 text-lg font-extrabold text-red-800 hover:text-green-500 2xl:mr-16"
								type='button'
								onClick={logout}
          		>
            		Logout
         			</button>
						</li>
          </ul>

				{/* NOTIFICATIONS */}
					<Dropdown
            arrowIcon={false}
            className="pb-3 pr-1"
						style={{ background: '#fcd9bd'}}
            label={
              <img
                style={{
                  width: "32px",
                  height: "32px",
                   backgroundColor: "#fcd9bd",
                }}
                src={imgSrc}
                alt="Notifications"
              />
            }
          >
            {dbNotifications &&
              dbNotifications.length > 0 &&
              dbNotifications.map((dbnotif) => (
                <Dropdown.Item
                  key={dbnotif.id}
                  onClick={() => setAsRead(dbnotif.id)}
                >
                  {dbnotif.message}
                </Dropdown.Item>
              ))}

					 {notifications.map((notification) => (
						<Dropdown.Item key={shortid.generate()}
							onClick={() => clearNotification(notification)
							}
						>
							{notification}
						</Dropdown.Item>
					 )
					 )}
				</Dropdown>

		{/* AVATAR DROPDOWN */}

			<Dropdown
				arrowIcon={false}
				class="mt-4 pl-2 pr-3"
				inline
				label={
					<Avatar
						alt="User settings"
						img={require("../images/user.png")}
						style={{
							padding: "3px",
						}}
						rounded
						bordered
						color="success"
					/>
				}
				placement="bottom"
			>
				<Dropdown.Header>
						<span className="block text-sm">{itsMe.username}</span>
					</Dropdown.Header>
				<Dropdown.Item href="/browse">
					<Link to='/browse'>Browse</Link>
				</Dropdown.Item>
				<Dropdown.Item href="/matches">
					<Link to='/matches'>Matches</Link>
				</Dropdown.Item>
				<Dropdown.Item href="/chat">
					<Link to='/chat'>Chat</Link>
				</Dropdown.Item>
				<Dropdown.Item href="/who">
					<Link to='/who'>Who Liked You</Link>
				</Dropdown.Item>
				<Dropdown.Item href="/likedProfiles">
					<Link to='/likedProfiles'>Liked</Link>
				</Dropdown.Item>
				<Dropdown.Divider />
				<Dropdown.Item>
					<Link to="/profile">Profile</Link>
				</Dropdown.Item>
				<Dropdown.Item>
					<Link to="/profileEdit">Edit Profile</Link>
				</Dropdown.Item>
				<Dropdown.Item>
					<Link to="/changePw">Change Password</Link>
				</Dropdown.Item>
				<Dropdown.Divider />
				<Dropdown.Item>
					<button type='button' onClick={logout}>Logout</button>
				</Dropdown.Item>
			</Dropdown>


			</div>
			:
			<div className="flex flex-row px-2">
				<div className="px-2 my-1">
          <Link
            className="block h-12 w-32 rounded border-[3px] border-indigo-900 bg-indigo-800 px-6 py-2 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-indigo-900"
            to="/register"
          >
            Register
          </Link>
        </div>
        <div className="px-2 my-1">
          <Link
            className="block h-12 w-32 rounded border-[3px] border-green-600 bg-green-500 px-6 py-2 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-green-600"
            to="/login"
          >
            Login
          </Link>
        </div>
			</div>
		}
	</Navbar>
	);
}

Nav.propTypes = {
	socket: PropTypes.instanceOf(Socket),
	 notifications: arrayOf(string),
	 setNotifications: func,
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
	dbNotifications: arrayOf(PropTypes.shape({
		id: PropTypes.number,
		message: PropTypes.string
	})),
	setDbNotifications: PropTypes.func
}

Nav.defaultProps = {
	socket: '',
	 notifications: [],
	 setNotifications: () => [],
	itsMe: {},
	dbNotifications: [],
	setDbNotifications: () => {}
}

export default Nav;

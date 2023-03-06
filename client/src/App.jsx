import "./index.css";
import { Suspense, useEffect, useState } from "react";
import io from 'socket.io-client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from 'axios';
import axiosStuff from "services/axiosstuff";
import Chat from "components/chat";
import RegisterTwo from "components/registerTwo";
import UserCard from "components/usercard";
import MatchCard from "components/matchcard";
import WhoLiked from "components/whoLiked";
import Forgot from "components/forgot";
import Forgot2 from "components/forgot2";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Login from "./components/login";
import Logout from './components/logout';
import Register from "./components/register";
import Homepage from "./components/homepage";
import Browse from "./components/browse";
import Profile from "./components/profile";
import ProfileEdit from "./components/profileEdit";
import ChangePw from './components/changePw'
import Matches from "./components/matches";
import Liked from "./components/liked"

function useApp() {
	const [socket, setSocket] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [dbNotifications, setDbNotifications] = useState([]);
  const [itsMe, setItsMe] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  axios.defaults.withCredentials = true // For the sessions the work

  useEffect(() => {
		axiosStuff
			.getCookie()
			.then((response) => {
				if (response.loggedIn === true) {
          setLoggedIn(true);
          setItsMe(response.user);
          axiosStuff
          .getNotifications().then((response2) => {
            setDbNotifications(response2.rows);
          })
				}
			})
	 }, [loggedIn])

  useEffect(() => {
    const socket1 = io('http://localhost:3001');
    setSocket(socket1)
   }, [])

   useEffect(() => {
		if (socket && itsMe.id) {
			socket.emit('join_room', itsMe.id);
		}
	 }, [socket, itsMe.id] )

   useEffect(() => {
		if (socket) {
			socket.on('recieve_notification', data => {
        if (data) {
          // console.log('NOTIFICATION', data)
          setNotifications([...notifications, data])
        }
			})
		}
	 }, [socket, notifications])

	 return {
		socket, notifications, setNotifications, dbNotifications, setDbNotifications,
		itsMe, setLoggedIn, loggedIn
	 }
}

function App() {
	const { socket, notifications, setNotifications, dbNotifications,
		setDbNotifications, itsMe, setLoggedIn, loggedIn } = useApp();

	if (!socket || !notifications || !setDbNotifications ||
		!dbNotifications || !setDbNotifications || !itsMe ||
		!setLoggedIn ) {
			return (<p>Loading...</p>)
		}

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="flex flex-col min-h-screen wrapper">
      <Router>
        <Navbar itsMe={itsMe} socket={socket}
          notifications={notifications} setNotifications={setNotifications}
          dbNotifications={dbNotifications} setDbNotifications={setDbNotifications}
        />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registerTwo" element={loggedIn ? <RegisterTwo itsMe={itsMe} /> : <Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout loggedIn={loggedIn} setLoggedIn={setLoggedIn} /> } />
          <Route path="/profile" element={loggedIn ? <Profile /> : <Homepage />} />
          <Route path="/browse" element={loggedIn ? <Browse loggedIn={loggedIn} itsMe={itsMe} socket={socket} /> : <Homepage />} />
					<Route path="/likedProfiles" element={loggedIn ? <Liked itsMe={itsMe} /> : <Homepage />} />
		      <Route path='/profile/:user' element={loggedIn ? <UserCard itsMe={itsMe} socket={socket} /> : <Homepage />} />
          <Route path="/matches" element={loggedIn ? <Matches itsMe={itsMe} /> : <Homepage />} />
          <Route path="/match/:user" element={loggedIn ? <MatchCard itsMe={itsMe} socket={socket} /> : <Homepage />} />
					<Route path="/who" element={loggedIn ? <WhoLiked itsMe={itsMe} /> : <Homepage />} />
          <Route path="/profileEdit" element={loggedIn ? <ProfileEdit /> : <Homepage />} />
          <Route path="/changePw" element={loggedIn ? <ChangePw itsMe={itsMe} /> : <Homepage />} />
          <Route path="/chat" element={loggedIn ? <Chat itsMe={itsMe} /> : <Homepage />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/get/:token" element={<Forgot2 />} />
          <Route path='*' element={<Homepage />} />
        </Routes>
        <Footer />
      </Router>
    </div>
    </Suspense>
  );
}

export default App;

	// const [socket, setSocket] = useState(null);
	// const [notifications, setNotifications] = useState([]);
	// const [dbNotifications, setDbNotifications] = useState([]);
  // const [itsMe, setItsMe] = useState({});
  // const [loggedIn, setLoggedIn] = useState(false)

  // axios.defaults.withCredentials = true // For the sessions the work


  //  useEffect(() => {
	// 	axiosStuff
	// 		.getCookie()
	// 		.then((response) => {
  //       // if (response)
	// 			//   console.log('huhu', response)
	// 			if (response.loggedIn === true) {
  //         setItsMe(response.user);
  //         setLoggedIn(true);
  //         // axiosStuff
  //         // .getNotifications().then((response2) => {
  //         //   setDbNotifications(response2.rows)
  //         // })
	// 			}
	// 		})
	//  }, [loggedIn])

  //   // console.log('DBNOTIFFFF APPJSX', dbNotifications.map(joo => joo))


  // useEffect(() => {
  //   const socket1 = io('http://localhost:3001');
  //   setSocket(socket1)
  //  }, [])

  //  useEffect(() => {
	// 	if (socket && itsMe.id) {
	// 		socket.emit('join_room', itsMe.id);
	// 	}
	//  }, [socket, itsMe.id] )

  //  useEffect(() => {
	// 	if (socket) {
	// 		socket.on('recieve_notification', data => {
  //       if (data) {
  //         console.log('NOTIFICATION', data)
  //         setNotifications([...notifications, data])
  //       }
	// 		})
	// 	}
	//  })

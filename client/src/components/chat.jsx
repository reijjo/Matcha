import { useState, useEffect} from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import axiosStuff from "../services/axiosstuff";
import ChatPreview from "./chatPreview";

function useChat() {
	const [matched, setMatched] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [reported, setReported] = useState([]);
	const [userCoords, setUserCoords] = useState(null)
	const [myBlockStatus, setMyBlockStatus] = useState('');

	useEffect(() => {
		axiosStuff
		.getMatches().then((response) => {
		// console.log('response' , response)
		 if (response.rows)
				setMatched(response.rows)
		})
	 axiosStuff
	 .getMatchBlock().then((response) => {
		// console.log('matchbloc', response.rows)
		 setBlocked(response.rows.map(blk => blk.block_id))
		 setReported(response.rows.map(rep => rep.report_id))
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
    .amiblocked().then((response) => {
      setMyBlockStatus(response.rows.map((user) => user.user_id))
    })
  }, [])

	return {
		matched, blocked, reported, userCoords, myBlockStatus
	}
}

function Chat( props ) {
  const { itsMe } = props;
	const { matched, blocked, reported, userCoords, myBlockStatus } = useChat()

  axios.defaults.withCredentials = true;

	// console.log('matches',  matched.filter(user => blocked.includes(user.user_id)).length)

  return (
    <section className="flex-grow py-10 bg-orange-200">
      <div className="container px-4 mx-auto">
        <span className="text-lg font-extrabold text-orange-500">
          Your matches
        </span>
        <h1 className="mt-4 mb-6 text-3xl font-extrabold font-heading md:text-4xl">
          Choose your own adventure.
        </h1>
        <p className="mb-16 text-xl font-extrabold leading-8">
          Your destiny is in your own hands.
        </p>
        <div className="flex flex-wrap -mx-4 -mb-8">
					{
					matched.filter(user => !blocked.includes(user.user_id) &&
          !reported.includes(user.user_id) && !myBlockStatus.includes(user.user_id))
          .map(users =>
						<ChatPreview
              itsMe={itsMe}
							key={users.user_id}
							userId={users.user_id}
							username={users.username}
							firstname={users.firstname}
							lastname={users.lastname}
							location={users.location}
							age={users.age}
							coordinates={users.coordinates}
							loggedCoords={userCoords}
							bio={users.bio}
							online={users.online}
							isonline={users.isonline}
						/>
					)
					}
        </div>
      </div>
  {/* BLOCKED USERS */}
          <div className="container px-4 mx-auto">
          {matched.filter(user => blocked.includes(user.user_id)).length ?
            <h1 className="mt-4 mb-6 text-3xl font-extrabold font-heading md:text-4xl">
              BLOCKED USERS
            </h1>
           :
           null
          }

            <div className="flex flex-wrap -mx-4 -mb-8">
              {
              matched.filter(user => blocked.includes(user.user_id)).map(users =>
                <ChatPreview
                  key={users.user_id}
                  userId={users.user_id}
                  username={users.username}
                  firstname={users.firstname}
                  lastname={users.lastname}
                  location={users.location}
                  age={users.age}
                  coordinates={users.coordinates}
                  loggedCoords={userCoords}
                  bio={users.bio}
                />
              )
              }
            </div>
          </div>


    </section>

  );
}

Chat.propTypes = {
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

Chat.defaultProps = {
  itsMe: {}
}

export default Chat;

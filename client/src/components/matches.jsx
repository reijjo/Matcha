import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import axiosStuff from "../services/axiosstuff";
import MatchPreview from './matchpreview';

function useMatches() {
  const [matched, setMatched] = useState([]);
	const [userCoords, setUserCoords] = useState(null)
  const [blocked, setBlocked] = useState([]);
  const [reported, setReported] = useState([]);
  const [myBlockStatus, setMyBlockStatus] = useState('')

	const [images2, setImages2] = useState([]);


  axios.defaults.withCredentials = true;

  useEffect(() => {
    axiosStuff
    .getCookie().then((response) => {
      if (response.loggedIn === false)
        window.location.replace('/');
    })
  }, [])

	 useEffect(() => {
	 	axiosStuff
	 	.getMatches().then((response) => {
      if (response.rows)
	 		  setMatched(response.rows)
	 	})
    axiosStuff
    .getMatchBlock().then((response) => {
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

    useEffect(() => {
      axiosStuff.getImages().then((response) => {
        setImages2(response.rows);
      });
     }, []);

  return {
    matched, userCoords, blocked, reported, myBlockStatus, images2
  }
}

function Matches({ itsMe }) {
  const { matched, userCoords, blocked, reported, myBlockStatus, images2 } = useMatches();

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
						<MatchPreview
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
							itsMe={itsMe}
              images2={images2}
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
                <MatchPreview
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
                  isonline={users.isonline}
									itsMe={itsMe}
                  images2={images2}
                />
              )
              }
            </div>
          </div>
    </section>

  );
}

Matches.propTypes = {
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

Matches.defaultProps = {
	itsMe: {}
}

export default Matches;


	// const [matched, setMatched] = useState([]);
	// const [userCoords, setUserCoords] = useState(null)
  // const [blocked, setBlocked] = useState([]);
  // const [reported, setReported] = useState([]);

  // const [myBlockStatus, setMyBlockStatus] = useState('')

  // axios.defaults.withCredentials = true;

  // useEffect(() => {
  //  axiosStuff
  //  .getCookie().then((response) => {
  //    if (response.loggedIn === false)
  //      window.location.replace('/');
  //  })
  // }, [])

	//  useEffect(() => {
	// 	axiosStuff
	// 	.getMatches().then((response) => {
  //    if (response.rows)
	// 		  setMatched(response.rows)
	// 	})
  //  axiosStuff
  //  .getMatchBlock().then((response) => {
  //    console.log('matchbloc', response.rows)
  //    setBlocked(response.rows.map(blk => blk.block_id))
  //    setReported(response.rows.map(rep => rep.report_id))
  //  })
	//  }, [])

	//  useEffect(() => {
	// 	axiosStuff
	// 	.getUserCoords().then((response) => {
	// 		setUserCoords(response.coordinates)
	// 		})
	//  	}, [])

  //   useEffect(() => {
  //    axiosStuff
  //    .amiblocked().then((response) => {
  //      setMyBlockStatus(response.rows.map((user) => user.user_id))
  //    })
  //   }, [])

  // if (myBlockStatus)
  // console.log('MITESMITES', myBlockStatus)
	// console.log('matches',  matched.filter(user => blocked.includes(user.user_id)).length)
  // console.log('BLOCKED', myBlockStatus)

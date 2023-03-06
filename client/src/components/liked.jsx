import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from 'prop-types';
import axiosStuff from "../services/axiosstuff";
import LikedPreview from './likedPreview';

function useLiked() {
	const [liked, setLiked] = useState([]);
	const [userCoords, setUserCoords] = useState(null);

	const [images2, setImages2] = useState([]);


	axios.defaults.withCredentials = true;

	useEffect(() => {
		axiosStuff
		.getLiked().then((response) => {
			setLiked(response.rows)
		})
	}, [])

	useEffect(() => {
		axiosStuff
		.getUserCoords().then((response) => {
			setUserCoords(response.coordinates)
			})
		}, [])

  useEffect(() => {
    axiosStuff.getImages().then((response) => {
      setImages2(response.rows);
    });
   }, []);

	return { liked, userCoords, images2 }
}

function Liked({ itsMe }) {
	const hook = useLiked(itsMe);
	const { liked, userCoords, images2 } = hook;

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
					liked.map(users =>
						<LikedPreview
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
              images2={images2}
						/>
					)
					}
        </div>
      </div>
    </section>
  );
}

Liked.propTypes = {
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

Liked.defaultProps = {
  itsMe: {}
}

export default Liked;

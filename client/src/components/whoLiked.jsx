import { useState, useEffect } from "react";
import axios from "axios";
import axiosStuff from "../services/axiosstuff";
import WhoLikedPreview from './whoLikedPreview';

function useWhoLike() {
	const [whoLiked, setWhoLiked] = useState([]);
	const [userCoords, setUserCoords] = useState(null)

	const [images2, setImages2] = useState([]);


  axios.defaults.withCredentials = true;

	useEffect(() => {
		axiosStuff
		.getWhoLiked().then((response) => {
			setWhoLiked(response.rows)
		})
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

	return { whoLiked, userCoords, images2}
}

function WhoLiked() {

		const { whoLiked, userCoords, images2 } = useWhoLike();

		if (!whoLiked || !userCoords) {
			return <p>Loading...</p>
		}

  return (
    <section className="flex-grow py-10 bg-orange-200">
      <div className="container px-4 mx-auto">
        <span className="text-lg font-extrabold text-orange-500">
          They liked you:
        </span>
        <h1 className="mt-4 mb-6 text-3xl font-extrabold font-heading md:text-4xl">
          Choose your own adventure.
        </h1>
        <p className="mb-16 text-xl font-extrabold leading-8">
          Your destiny is in your own hands.
        </p>
        <div className="flex flex-wrap -mx-4 -mb-8">
					{
				whoLiked.map(users =>
						<WhoLikedPreview
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

export default WhoLiked;

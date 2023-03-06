import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Carousel } from 'flowbite-react'
import axiosStuff from "../services/axiosstuff";

function useProfile() {
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState("");
	const [location, setLocation] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [age, setAge] = useState('');
	const [gender, setGender] = useState('');
	const [seeking, setSeeking] = useState('');
	const [tags, setTags] = useState('');
	const [bio, setBio] = useState('');
  const [fame, setFame] = useState('');

  const [visited, setVisited] = useState('');
  const [stalker, setStalker] = useState('');

  const [images2, setImages2] = useState([]);
  const userImages2 = images2.length
  ? images2.filter((image) => image.user_id === userId)
  : [];

  axios.defaults.withCredentials = true; // sessionit toimii nyt

  // Get profile infos
	useEffect(() => {
		axiosStuff
		.profileEdit()
		.then((response) => {
      setUserId(response.user_id)
      setUsername(response.username)
			setLocation(response.location)
			setFirstName(response.firstname);
			setLastName(response.lastname);
			setAge(response.age);
			setGender(response.gender);
			setSeeking(response.seeking);
			setTags(response.tags);
			setBio(response.bio);
      setFame(response.fame)
			// console.log('MYPROFILE', response)
		})
	}, [])

  // Get profiles
	 useEffect(() => {
		axiosStuff
		.browse()
		// .then((response2) => {
		//	console.log('browse response:', response2.rows)
		// })
	 })

  // For visited profiles
  useEffect(() => {
    axiosStuff
    .getVisitedProfiles()
    .then((response) => {
      // console.log(response.rows);
      const links = response.rows.map((profile, index) => {
        if (index === 0) {
          return (
            <React.Fragment key = {profile.username}>
              <Link to ={`/profile/${profile.username}`}>
                {profile.username}
              </Link>
            </React.Fragment>
          )
        }
          return (
            <React.Fragment key = {profile.username}>
            , <Link to ={`/profile/${profile.username}`}>
              {profile.username}
            </Link>
          </React.Fragment>
          )
        }
      )
      setVisited(links)
      // console.log(links)
    })
  }, [])

  // For your stalkers
  useEffect(() => {
    axiosStuff
    .getStalkerProfiles()
    .then((response) => {
      // console.log(response.rows);
      const links = response.rows.map((profile, index) => {
        if (index === 0) {
          return (
            <React.Fragment key = {profile.username}>
              <Link to ={`/profile/${profile.username}`}>
                {profile.username}
              </Link>
            </React.Fragment>
          )
        }
          return (
            <React.Fragment key = {profile.username}>
            , <Link to ={`/profile/${profile.username}`}>
              {profile.username}
            </Link>
          </React.Fragment>
          )
        }
      )
      setStalker(links);
      // console.log('stalker links', links)
    })
  }, [])

  useEffect(() => {
    axiosStuff.getImages().then((response) => {
      setImages2(response.rows);
      // console.log("images2", response);
    });
  }, []);

  return {
    username, location, firstName, lastName, age, gender,
    seeking, tags, bio, fame, visited, stalker, userImages2
  }
}

function Profile() {
  const {
    username, location, firstName, lastName, age, gender,
    seeking, tags, bio, fame, visited, stalker, userImages2
  } = useProfile();

  let tagsString = [];
  if (tags) {
    tagsString = tags.join(', #');
    // console.log('MINAAA', tagsString)
  }

  return (
	<section className="flex-grow py-10 bg-orange-200">
	<div className="container px-4 py-10 mx-auto">
	<div className="flex flex-wrap justify-center -mx-4">
		<div className="w-full px-4 lg:w-1/2">
			<div className="flex h-full flex-col rounded-2xl border-[3px] border-indigo-900 bg-white shadow-md">
				<div className="flex flex-wrap items-center justify-between px-6 py-12 border-indigo-900 lg:px-12">
					<div className="w-full mb-4 sm:mb-0 sm:w-1/2">MY PROFILE
						<h2 className="text-2xl font-extrabold">{username}</h2>
						<p className="text-lg font-extrabold leading-7">
							{location}
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
          <div><span className="text-lg font-bold">Fame:</span> {fame}/50</div>
					<div><span className="text-lg font-bold">Firstname:</span> {firstName}</div>
					<div><span className="text-lg font-bold">Lastname:</span> {lastName}</div>
					<div><span className="text-lg font-bold">Age:</span> {age}</div>
					<div><span className="text-lg font-bold">Gender:</span> {gender}</div>
					<div><span className="text-lg font-bold">Seeking:</span> {seeking}</div>
					<div><span className="text-lg font-bold">Tags:</span> #{tagsString}</div>
					<div><span className="text-lg font-bold">Bio:</span> {bio}</div>
					<div><span className="text-lg font-bold">Visited profiles:</span> {[visited]}</div>
          <div><span className="text-lg font-bold">People who stalked you:</span> {[stalker]}</div>
				</div>
			</div>
		</div>
	</div>

	{/* <div>This card belongs to <b>{username}</span>></div> */}
</div>
</section>
  );
}

export default Profile;

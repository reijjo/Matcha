import { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import shortid from "shortid";
import axiosStuff from "services/axiosstuff";
import Tags from "services/tagsInput/tagsInput";
import { Button } from 'flowbite-react';
import InfoText from "./infoText";

function useRegisterTwo(itsMe) {
	const [message, setMessage] = useState(null);
  const [ageReg, setAgeReg] = useState('');
  	// Location
  const [gpsStatus, setGpsStatus] = useState(null);
  const [lng, setLng] = useState(null);
  const [lat, setLat] = useState(null);

  const [genderReg, setGenderReg] = useState('Select One');
  const [seekingReg, setSeekingReg] = useState('Select One');
  const [tagsReg, setTagsReg] = useState([]);
  const [bioReg, setBioReg] = useState('');
  // Upload
  const fileInput = useRef(null);
  const [imageURLs, setImageURLs] = useState([]);
  const [images, setImages] = useState([]);
  const [images2, setImages2] = useState('');

  const [isLoading, setIsLoading] = useState(true);

  axios.defaults.withCredentials = true; // for sessions

	const getLocation = () => {
		if (!navigator.geolocation) {
			setGpsStatus('Geolocation is not supported by your browser');
		}
		else {
			// setGpsStatus('Locating...');
			setMessage('Locating...')
			navigator.geolocation.getCurrentPosition((position) => {
				setGpsStatus(null);
				// setCity(position);
				setLat(position.coords.latitude);
				setLng(position.coords.longitude);
				// console.log(position)
			}, () => {
				setGpsStatus(gpsStatus);
			})
		}
		setTimeout(() => {
			setMessage(null);
		}, 4000)
	};

	useEffect(() => {
			axiosStuff
      .getLocationData()
      .then((response) => {
        setLat(response.parsed.latitude)
        setLng(response.parsed.longitude)
        const capital = response.parsed.country_capital;
        const country = response.parsed.country_name;
        setGpsStatus(`${capital}, ${country}`)
      })
   }, []);

	 const registerTwo = async (event) => {
    event.preventDefault();
    const finishUser = {
      userId: itsMe.id,
      username: itsMe.username,
      age: ageReg,
      location: gpsStatus,
      coordinates: [lng, lat],
      gender: genderReg,
      seeking: seekingReg,
      tags: tagsReg,
      bio: bioReg,
      firstname: itsMe.firstname,
      lastname: itsMe.lastname,
      email: itsMe.email,
      password: itsMe.password
    }
    if ((genderReg !== 'Select One' && seekingReg !== 'Select One') && (
      bioReg.length > 0 && bioReg.length < 101 && bioReg.match(/^[a-zA-Z0-9 _.!@-]+$/))) {
      await axiosStuff
      .register2(finishUser)
      .then((response) => {
        // console.log(response.data);
        setMessage(response.message)
        // event.target.reset();
        window.location.replace('/browse');
      })
    }
    else {
      setMessage(`Check your gender and what you are seeking. And also check
      that your bio length is 1-100 characters and only contains characters a-z and A-Z
      and " _.!@-"`)
    }
   }

	 const handleAgeReg = (event) => {
    setAgeReg(event.target.value);
   }

   const handleGenderReg = (event) => {
    setGenderReg(event.target.value)
   }

   const handleSeekingReg = (event) => {
    setSeekingReg(event.target.value);
   }

   const handleBioReg = (event) => {
    setBioReg(event.target.value);
   }

  // Imagestuff
  useEffect(() => {
    axiosStuff.getImages().then((response) => {
      setImages2(response.rows)
    })
  }, []);

  useEffect(() => {
		if (images.length < 1 || images.length > 5) return;
		const newImageURLs = [];
		images.forEach((image, i) => {
			newImageURLs.push({ id: i, url: URL.createObjectURL(image) });
		});
		setImageURLs(newImageURLs);
	}, [images]);

   const userImages2 = images2.length ?
    images2.filter(image => image.user_id === itsMe.id) :
    [];

  function onImageChange(e) {
		const newImages = [...images, ...e.target.files];
		setImages(newImages);
	}

   const handleFakeDelete = (imageId) => {
    const del = {
      delete1: imageId
    }
     axiosStuff.delFakeImg(del)
    //  .then((response) => {
      .then(() => {
      setImages2(images2.filter(img => img.id !== imageId))
      // console.log(response);
     })
	 }

   const userIdReg = itsMe.id;

   async function handleMain(imageId) {
		try {
			await axios.put(`http://localhost:3001/images/user/${userIdReg}/${imageId}`, {
				avatar: false,
				userIdReg
			});
			await axios.put(`http://localhost:3001/images/user/${userIdReg}/${imageId}`, {
				avatar: true,
				userIdReg
			});
		} catch (error) {
			throw new Error(error)
		}
	}

  async function uploadImages(imageFiles) {
		const formData = new FormData();
		imageFiles.forEach((image) => {
			formData.append(`image`, image);
		});

		try {
			const response = await fetch("http://localhost:3001/upload/", {
				method: "POST",
				body: formData,
				credentials: "include",
			});
      // console.log('resp', response)
			if (!response.ok) throw new Error(response.statusText);
      const newImages = await axiosStuff.getImages();
        setImages2(newImages.rows);
			// console.log(await response.json());
		} catch (error) {
			// console.error(error);
      throw new Error(error)
		}
	}

  const handleSubmit = (event) => {
		event.preventDefault();
    if (images.length > 1) {
      setMessage('Only one file at the time.');
      setImages([]);
      setImageURLs([]);
    }
    else if (!images.length) {
      setMessage('No images to upload.')
    }
    else {
      uploadImages(images);
      setImages([]);
      setImageURLs([]);
    }
    setTimeout(() => {
      setMessage(null)
    }, 3000)
	};

  const onCancel = () => {
    setImageURLs([]);
    setImages([]);
  }


	return {
		message, gpsStatus, lng, lat,	tagsReg, getLocation,
		registerTwo, handleAgeReg,handleGenderReg,
		handleSeekingReg, handleBioReg, setTagsReg, userImages2,
    handleMain, imageURLs, fileInput, onImageChange,
    handleSubmit, handleFakeDelete, genderReg, seekingReg,
    setIsLoading, isLoading, onCancel
	}
}

function RegisterTwo({ itsMe }) {
  const hook = useRegisterTwo(itsMe)
	const { message, gpsStatus, lng, lat, tagsReg, getLocation,
		registerTwo, handleAgeReg,handleGenderReg, handleSeekingReg,
		handleBioReg, setTagsReg, userImages2, handleMain, imageURLs,
    fileInput, onImageChange, handleSubmit, handleFakeDelete, genderReg, seekingReg,
    setIsLoading, isLoading, onCancel
  } = hook;

  setTimeout(() => {
    setIsLoading(false);
  }, 1000)


  if (isLoading) {
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
    <div className="flex-grow py-10 overflow-hidden bg-orange-200 lg:min-h-screen lg:py-10">
		{/* <form onSubmit={registerTwo}> */}
		  <div className="container px-4 py-10 mx-auto">
        <div className="h-full overflow-hidden rounded-md border-[3px] border-indigo-900 bg-white p-6">
          <div className="pb-6 border-b border-indigo-900">
            <div className="flex flex-wrap items-center justify-between -m-2">
              <div className="w-full p-2 md:w-auto">
                <h2 className="text-lg font-semibold text-coolGray-900">
                  Personal info
                </h2>
							  <InfoText message={message}/>
              </div>
            </div>
          </div>
	{/* PHOTO */}
        {/* current photos */}
        <form onSubmit={handleSubmit}>
        <div className="py-6 border-b border-indigo-900">
							<div className="w-full md:w-9/12">
								<div className="flex flex-wrap -m-3">
									<div className="w-full p-3 md:w-1/3">
										<p className="text-sm font-semibold text-coolGray-800">
											Current Photos
										</p>
										<p className="text-xs font-medium text-coolGray-500">
											Current Profile Images
										</p>
									</div>
									<div className="w-full py-3 mb-8 md:flex-1">
										<div className="flex flex-wrap w-auto">
											{userImages2.map((image) => (
												<div key={image.id}
                          className="relative flex-none w-2/5 mb-3 ml-2 justify-items-center h-128 sm:h-64 xl:h-80 2xl:h-96 rounded-2xl">
													<img className="border-[3px] border-indigo-900 w-full object-fit h-64 sm:h-64 xl:h-64 2xl:h-64 rounded-2xl" src={image.path
													} alt={image.name} key={image.id} />
													<div className="absolute bottom-0 w-3/4 py-2 text-center" style={{ left: '50%', transform: 'translateX(-50%)' }}>
														<Button.Group>
															<Button className="w-1/3 text-white bg-green-500 border border-green-600 rounded-md hover:bg-green-600 profile-button" color="green" onClick={() => handleMain(image.id)}>
																Main
															</Button>
															<Button type="button" className="w-1/3 text-white bg-red-500 border border-red-600 rounded-md hover:bg-red-600 delete-button"
																color="red" onClick={() => handleFakeDelete(image.id)}>
																Delete
															</Button>
														</Button.Group>
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
        {/* images to upload */}
           <div className="py-6 border-b border-indigo-900">
							<div className="w-full md:w-9/12">
								<div className="flex flex-wrap -m-3">
									<div className="w-full p-3 md:w-1/3">
										<p className="text-sm font-semibold text-coolGray-800">
											Photos
										</p>
										<p className="text-xs font-medium text-coolGray-500">
											Images to Upload
										</p>
									</div>
									<div className="w-full py-3 md:flex-1">
										<div className="flex flex-wrap w-auto">
											{imageURLs.map((image) => (
												<div key={image.id}
                          className="flex-none w-2/5 h-64 mb-3 ml-2 sm:h-64 xl:h-64 2xl:h-64">
													<img
														key={image.id}
														src={image.url}
														alt="preview"
														className="border-[3px] border-indigo-900 w-full object-fit h-64 sm:h-64 xl:h-64 2xl:h-64 rounded-2xl"
													/>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
        {/* upload button */}
            <div className="py-6 border-b border-indigo-900">
							<div className="w-full md:w-9/12">
								<div className="flex flex-wrap -m-3">
									<div className="w-full p-3 md:w-1/3">
										<p className="text-sm font-semibold text-coolGray-800">
											Image Upload
										</p>
										<p className="text-xs font-medium text-coolGray-500">
											Show Your Matcha
										</p>
									</div>

									<div className="w-full p-3 md:flex-1">
										<div className="relative flex flex-col items-center justify-center p-6 text-center text-green-500 border border-indigo-900 border-dashed rounded-lg h-44 focus-within:border-green-500">
											<svg
												className="mb-1.5"
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M8.71 7.71L11 5.41V15C11 15.2652 11.1054 15.5196 11.2929 15.7071C11.4804 15.8946 11.7348 16 12 16C12.2652 16 12.5196 15.8946 12.7071 15.7071C12.8946 15.5196 13 15.2652 13 15V5.41L15.29 7.71C15.383 7.80373 15.4936 7.87813 15.6154 7.92889C15.7373 7.97966 15.868 8.0058 16 8.0058C16.132 8.0058 16.2627 7.97966 16.3846 7.92889C16.5064 7.87813 16.617 7.80373 16.71 7.71C16.8037 7.61704 16.8781 7.50644 16.9289 7.38458C16.9797 7.26272 17.0058 7.13202 17.0058 7C17.0058 6.86799 16.9797 6.73729 16.9289 6.61543C16.8781 6.49357 16.8037 6.38297 16.71 6.29L12.71 2.29C12.6149 2.19896 12.5028 2.1276 12.38 2.08C12.1365 1.97999 11.8635 1.97999 11.62 2.08C11.4972 2.1276 11.3851 2.19896 11.29 2.29L7.29 6.29C7.19676 6.38324 7.1228 6.49393 7.07234 6.61575C7.02188 6.73758 6.99591 6.86814 6.99591 7C6.99591 7.13186 7.02188 7.26243 7.07234 7.38425C7.1228 7.50607 7.19676 7.61677 7.29 7.71C7.38324 7.80324 7.49393 7.8772 7.61575 7.92766C7.73757 7.97812 7.86814 8.00409 8 8.00409C8.13186 8.00409 8.26243 7.97812 8.38425 7.92766C8.50607 7.8772 8.61676 7.80324 8.71 7.71ZM21 12C20.7348 12 20.4804 12.1054 20.2929 12.2929C20.1054 12.4804 20 12.7348 20 13V19C20 19.2652 19.8946 19.5196 19.7071 19.7071C19.5196 19.8946 19.2652 20 19 20H5C4.73478 20 4.48043 19.8946 4.29289 19.7071C4.10536 19.5196 4 19.2652 4 19V13C4 12.7348 3.89464 12.4804 3.70711 12.2929C3.51957 12.1054 3.26522 12 3 12C2.73478 12 2.48043 12.1054 2.29289 12.2929C2.10536 12.4804 2 12.7348 2 13V19C2 19.7957 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7957 22 19V13C22 12.7348 21.8946 12.4804 21.7071 12.2929C21.5196 12.1054 21.2652 12 21 12Z"
													fill="currentColor"
												/>
											</svg>
											<p className="mb-1 text-sm font-medium text-coolGray-800">
												<span className="text-green-500">
													Click to Upload a file
												</span>
												<span>or drag and drop</span>
											</p>
											<p className="text-xs font-medium text-coolGray-500">
												PNG, JPG, GIF or up to 10MB
											</p>
											<input
												className="absolute top-0 left-0 w-full h-full opacity-0"
												type="file"
												multiple
												accept="image/*"
												name="image"
												ref={fileInput}
												onChange={onImageChange}
											/>
										</div>
									</div>
								</div>
							</div>
          {/* save image buttons */}
              <div className="flex flex-wrap items-center justify-between -m-2">
								<div className="w-full p-2 md:w-auto">
									<h2 className="text-lg font-semibold text-coolGray-900">
										Save image changes
									</h2>
									<div className="text-xs font-medium text-coolGray-500">
										<InfoText message={message} />
									</div>
								</div>
								<div className="w-full p-2 md:w-auto">
									<div className="-m-1.5 flex flex-wrap justify-between">
                    <div className="w-full p-1.5 md:w-auto">
											<button
												type="submit"
												className="flex flex-wrap justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-500 border border-green-500 rounded-md shadow-button hover:bg-green-600 hover:border-green-900"
                      >
												<p>Save</p>
											</button>
										</div>
										<div className="w-full p-1.5 md:w-auto">
											<button
												type="button"
												className="flex flex-wrap justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-500 border border-red-600 rounded-md hover:bg-red-600 shadow-button hover:border-red-900"
												onClick={onCancel}
											>
												<p>Cancel</p>
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
        </form>
	{/* AGE */}
        <form onSubmit={registerTwo}>
          <div className="py-6 border-b border-indigo-900">
            <div className="w-full md:w-9/12">
              <div className="flex flex-wrap -m-3">
                <div className="w-full p-3 md:w-1/3">
                  <p className="text-sm font-semibold text-coolGray-800">Age</p>
                </div>
                <div className="w-full p-3 md:flex-1">
                  <input
                    className="text-coolGray-900 shadow-input w-full rounded-lg border border-indigo-900 px-4 py-2.5 text-base font-normal outline-none focus:border-green-500"
                    type="number"
                    placeholder="16 - 101"
                    required onChange={handleAgeReg}
                    min='16' max='101'
                  />
                </div>
              </div>
            </div>
          </div>
	{/* LOCATION */}
          <div className="py-6 border-b border-indigo-900">
          <div className="flex flex-1 py-6 border-b border-indigo-900">
              <div className="flex flex-wrap -m-3">
                <div className="w-full p-3 md:w-1/3">
                  <p className="text-sm font-semibold text-coolGray-800">
                    Location
                  </p>
                </div>
              </div>
              <div className="inline-flex flex-col items-center w-full p-3">
                <div className="inline-flex flex-col items-center w-full py-2 pr-4">
                <div
                    className="text-coolGray-900 shadow-input w-2/3 rounded-lg border border-indigo-900 py-2.5 text-base font-normal outline-none focus:border-green-600"
                    type="text"
                    value={gpsStatus}
                  >
                    Location: {gpsStatus}
                  </div>
                </div>
                <div className="inline-flex flex-col items-center w-full py-2 pr-4">
                  <div
                    className="text-coolGray-900 shadow-input w-2/3 rounded-lg border border-indigo-900 py-2.5 text-base font-normal outline-none focus:border-green-600"
                    type="text"
                    value={lng}
                  >
                    Longitude: {lng}
                  </div>
                </div>
                <div className="inline-flex flex-col items-center w-full py-2 pr-4">
                  <div
                    className="text-coolGray-900 shadow-input w-2/3 rounded-lg border border-indigo-900 py-2.5 text-base font-normal outline-none focus:border-green-600"
                    type="text"
                    value={lat}
                  >
                    Latitude: {lat}
                  </div>
                </div>
                <div className="inline-flex flex-col items-center w-full pt-4 pr-4">
                  <button
                    type="button"
                    className="flex flex-wrap justify-center w-2/3 px-4 py-2 text-sm font-medium text-white bg-green-500 border border-green-600 rounded-md shadow-button hover:bg-green-600"
                    onClick={getLocation}
                  >
                    <p>Get Location</p>
                  </button>
                </div>
              </div>
            </div>

          </div>
	{/* GENDER */}
          <div className="py-6 border-b border-indigo-900">
            <div className="w-full md:w-9/12">
              <div className="flex flex-wrap -m-3">
                <div className="w-full p-3 md:w-1/3">
                  <p className="text-sm font-semibold text-coolGray-800">
                    Gender
                  </p>
                </div>
                <div className="w-full p-3 md:flex-1">
                  <div className="relative">
                    <svg
                      className="absolute transform -translate-y-1/2 right-4 top-1/2"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.3333 6.1133C11.2084 5.98913 11.0395 5.91943 10.8633 5.91943C10.6872 5.91943 10.5182 5.98913 10.3933 6.1133L8.00001 8.47329L5.64001 6.1133C5.5151 5.98913 5.34613 5.91943 5.17001 5.91943C4.99388 5.91943 4.82491 5.98913 4.70001 6.1133C4.63752 6.17527 4.58792 6.249 4.55408 6.33024C4.52023 6.41148 4.50281 6.49862 4.50281 6.58663C4.50281 6.67464 4.52023 6.76177 4.55408 6.84301C4.58792 6.92425 4.63752 6.99799 4.70001 7.05996L7.52667 9.88663C7.58865 9.94911 7.66238 9.99871 7.74362 10.0326C7.82486 10.0664 7.912 10.0838 8.00001 10.0838C8.08801 10.0838 8.17515 10.0664 8.25639 10.0326C8.33763 9.99871 8.41136 9.94911 8.47334 9.88663L11.3333 7.05996C11.3958 6.99799 11.4454 6.92425 11.4793 6.84301C11.5131 6.76177 11.5305 6.67464 11.5305 6.58663C11.5305 6.49862 11.5131 6.41148 11.4793 6.33024C11.4454 6.249 11.3958 6.17527 11.3333 6.1133Z"
                        fill="#8896AB"
                      />
                    </svg>
                    <select required
                      value={genderReg}
                      onChange={handleGenderReg}
                      // defaultValue='Select One'
                      className="text-coolGray-900 shadow-input w-full appearance-none rounded-lg border border-indigo-900 bg-white py-2.5 px-4 text-base font-normal outline-none focus:border-green-500">
                      <option>Select One</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
	{/* SEEKING */}
          <div className="py-6 border-b border-indigo-900">
            <div className="w-full md:w-9/12">
              <div className="flex flex-wrap -m-3">
                <div className="w-full p-3 md:w-1/3">
                  <p className="text-sm font-semibold text-coolGray-800">
                    Seeking
                  </p>
                </div>
                <div className="w-full p-3 md:flex-1">
                  <div className="relative">
                    <svg
                      className="absolute transform -translate-y-1/2 right-4 top-1/2"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.3333 6.1133C11.2084 5.98913 11.0395 5.91943 10.8633 5.91943C10.6872 5.91943 10.5182 5.98913 10.3933 6.1133L8.00001 8.47329L5.64001 6.1133C5.5151 5.98913 5.34613 5.91943 5.17001 5.91943C4.99388 5.91943 4.82491 5.98913 4.70001 6.1133C4.63752 6.17527 4.58792 6.249 4.55408 6.33024C4.52023 6.41148 4.50281 6.49862 4.50281 6.58663C4.50281 6.67464 4.52023 6.76177 4.55408 6.84301C4.58792 6.92425 4.63752 6.99799 4.70001 7.05996L7.52667 9.88663C7.58865 9.94911 7.66238 9.99871 7.74362 10.0326C7.82486 10.0664 7.912 10.0838 8.00001 10.0838C8.08801 10.0838 8.17515 10.0664 8.25639 10.0326C8.33763 9.99871 8.41136 9.94911 8.47334 9.88663L11.3333 7.05996C11.3958 6.99799 11.4454 6.92425 11.4793 6.84301C11.5131 6.76177 11.5305 6.67464 11.5305 6.58663C11.5305 6.49862 11.5131 6.41148 11.4793 6.33024C11.4454 6.249 11.3958 6.17527 11.3333 6.1133Z"
                        fill="#8896AB"
                      />
                    </svg>
                    <select required
                      value={seekingReg}
                      onChange={handleSeekingReg}
                      // defaultValue='Select One'
                      className="text-coolGray-900 shadow-input w-full appearance-none rounded-lg border border-indigo-900 bg-white py-2.5 px-4 text-base font-normal outline-none focus:border-green-500">
                      <option>Select One</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Both</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
  {/* TAGS */}
          <div className="py-6 border-b border-indigo-900">
              <div className="w-full md:w-9/12">
                <div className="flex flex-wrap -m-3">
                  <div className="w-full p-3 md:w-1/3">
                    <div className="text-sm font-semibold text-coolGray-800">
                      Interests
                      {tagsReg.map((tag) => (
                      <p
                        className="mb-2 mr-2 text-sm font-semibold text-coolGray-800"
                        key={shortid.generate()}
                      >
                        #{tag}
                      </p>
                      ))}
                    </div>
                  </div>
                  <div className="w-full p-3 md:flex-1">
                    <Tags tagsReg={tagsReg} setTagsReg={setTagsReg} />
                  </div>
                </div>
              </div>
            </div>
  {/* BIO */}
          <div className="pt-6">
            <div className="w-full md:w-9/12">
              <div className="flex flex-wrap -m-3">
                <div className="w-full p-3 md:w-1/3">
                  <p className="text-sm font-semibold text-coolGray-800">Bio</p>
                  <p className="text-xs font-medium text-coolGray-500">
                    Lorem ipsum dolor sit amet
                  </p>
                </div>
                <div className="w-full p-3 md:flex-1">
                  <textarea required onChange={handleBioReg}
                    className="block w-full h-64 p-6 text-base font-normal border border-indigo-900 rounded-lg outline-none resize-none text-coolGray-900 shadow-input focus:border-green-500"
                    placeholder="Tell us a bit more about yourself..."
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="w-full p-1.5 md:w-auto">
            <button
              type="submit"
              className="flex flex-wrap justify-center w-full px-4 py-2 text-sm font-medium text-white bg-green-500 border border-green-500 rounded-md shadow-button hover:bg-green-600"
              // onClick={registerTwo}
            >
              <p>Save</p>
            </button>
          </div>
        </form>
        </div>
      </div>
			{/* </form> */}
    </div>
  );
}

RegisterTwo.propTypes = {
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

RegisterTwo.defaultProps = {
	itsMe: {}
}

export default RegisterTwo;

import { useState } from "react";
import axios from "axios";
import axiosStuff from "../services/axiosstuff";

import InfoText from "./infoText";

function useRegister() {
	const [usernameReg, setUsernameReg] = useState("");
  const [firstReg, setFirstReg] = useState("");
  const [lastReg, setLastReg] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [passwordCReg, setCPasswordReg] = useState('');
  const [message, setMessage] = useState(null);

  axios.defaults.withCredentials = true; // sessionit toimii nyt

	const register = (event) => {
    event.preventDefault();
    const newUser = {
      username: usernameReg,
      firstname: firstReg,
      lastname: lastReg,
      email: emailReg,
      password: passwordReg,
      confPasswd: passwordCReg
    };
    axiosStuff.register(newUser).then((response) => {
      // console.log(response.data);
      setMessage(response.message);
    });
    setTimeout(() => {
      setMessage(null);
      // window.location.replace('/login');
    }, 8000);
    event.target.reset();
  };

  const handleUsernameReg = (event) => {
    setUsernameReg(event.target.value.toLowerCase());
  };

  const handleFirstReg = (event) => {
    setFirstReg(event.target.value);
  };

  const handleLastReg = (event) => {
    setLastReg(event.target.value);
  };

  const handleEmailReg = (event) => {
    setEmailReg(event.target.value);
  };

  const handlePasswordReg = (event) => {
    setPasswordReg(event.target.value);
  };

  const handleCPasswordReg = (event) => {
		setCPasswordReg(event.target.value);
	};

	return {
		usernameReg, firstReg, lastReg, emailReg, passwordReg, passwordCReg, message,
		handleUsernameReg, handleFirstReg, handleLastReg, handleEmailReg, handlePasswordReg,
		handleCPasswordReg, register
	}
}

function Register() {
	const { message, handleUsernameReg, handleFirstReg, handleLastReg,
		handleEmailReg, handlePasswordReg, handleCPasswordReg, register } = useRegister();

  return (
    <section className="relative flex-grow py-10 overflow-hidden bg-orange-200 lg:min-h-screen lg:py-10 no-text-size-adjust">
      {/* <div className="absolute top-0 right-0 hidden w-1/2 h-full bg-orange-200 border-indigo-900 border-l-3 lg:block" /> */}
      <div className="container relative px-4 py-10 mx-auto no-text-size-adjust">
        <div className="flex flex-wrap items-center -mx-4 no-text-size-adjust">
          <div className="w-full px-4 mb-14 lg:mb-0 lg:w-1/2 no-text-size-adjust">
            <div className="max-w-md mx-auto xl:max-w-lg no-text-size-adjust">
              <div className="mb-8 text-center no-text-size-adjust">
                <h2 className="mb-2 text-3xl font-extrabold md:text-4xl no-text-size-adjust">
                  Join Matcha
                </h2>
                <p className="text-lg font-extrabold leading-7 text-indigo-500 no-text-size-adjust">
                  Start your journey to a better match!
                </p>
              </div>
              <form onSubmit={register} data-bitwarden-watching="1">
								<InfoText message={message} />
                <div className="mb-6">
                  <label
                    className="block mb-2 font-extrabold no-text-size-adjust"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <input
                    className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow no-text-size-adjust"
                    type="text"
                    placeholder="Username"
										id="username"
                    required
                    autoComplete="off"
										onChange={handleUsernameReg}
                  />
                </div>
                <div className="mb-6 no-text-size-adjust">
                  <label
                    className="block mb-2 font-extrabold no-text-size-adjust"
                    htmlFor="firstName"
                  >
                    First Name
                  </label>
                  <input
                    className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow no-text-size-adjust"
                    type="text"
                    placeholder="First Name"
                    onChange={handleFirstReg}
                  />
                </div>
                <div className="mb-6 no-text-size-adjust">
                  <label
                    className="block mb-2 font-extrabold"
                    htmlFor="lastName"
                  >
                    Last Name
                  </label>
                  <input
                    className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow no-text-size-adjust"
                    type="text"
                    placeholder="Last Name"
                    onChange={handleLastReg}
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-extrabold no-text-size-adjust" htmlFor="email">
                    Email
                  </label>
                  <input
                    className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow no-text-size-adjust"
                    type="email"
                    placeholder="user@email.com" id="email"
										required autoComplete="off" onChange={handleEmailReg}
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block mb-2 font-extrabold no-text-size-adjust"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow no-text-size-adjust"
                    type="password"
                    placeholder="Password..."
										id="password"
						 				required autoComplete="off" onChange={handlePasswordReg}
                  />
                </div>
                <div className="mb-6 no-text-size-adjust">
                  <label
                    className="block mb-2 font-extrabold no-text-size-adjust"
                    htmlFor="password"
                  >
                    Confirm Password
                  </label>
                  <input
                    className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow no-text-size-adjust"
                    type="password"
                    placeholder="Confirm Password..."
										id="confirmPassword"
						 				required autoComplete="off" onChange={handleCPasswordReg}
                  />
                </div>
                <button
                  type="submit"
                  className="inline-block w-full px-6 py-4 mb-6 text-lg font-extrabold leading-6 text-center text-white transition duration-200 bg-indigo-800 border-indigo-900 rounded shadow no-text-size-adjust border-3 hover:bg-indigo-900"
                >
                  Sign Up
                </button>
                <p className="font-extrabold text-center no-text-size-adjust">
                  Have an account?{" "}
                  <a href="/login" className="text-indigo-500 no-text-size-adjust hover:underline">
                    Sign In
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;

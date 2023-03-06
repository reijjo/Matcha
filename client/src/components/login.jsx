import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import axios from "axios";
import axiosStuff from "../services/axiosstuff";
import InfoText from "./infoText";

function useLogin() {
  const [message, setMessage] = useState(null);
	const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginsStatus] = useState("");

  axios.defaults.withCredentials = true;

  const handleUsername = (event) => {
    setUsername(event.target.value.toLowerCase());
  };

  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

	const login = async (event) => {
    event.preventDefault();
    const login2 = {
      username,
      password,
    };
    await axiosStuff.login(login2).then((response) => {
      if (response.message)
        setMessage(response.message);
      if (response.result) {
        // console.log(response.result.rows[0]);
        setLoginsStatus(response.result.rows[0].username)
        if (response.result.rows[0].status === 1) {
          window.location.replace("/registerTwo");
          // console.log("ok");
        }
        else if (response.result.rows[0].status > 1) {
          window.location.replace('/browse')
        }
      }
    });
    setTimeout(() => {
      setMessage(null);
    }, 8000);
    event.target.reset();
  };

	return {
		message, loginStatus, handleUsername, handlePassword, login
	}
}

function Login( props ) {
  const { itsMe } = props;
	const { message, loginStatus, handleUsername, handlePassword, login } = useLogin();

	itsMe.username = loginStatus

  return (
    <section className="flex-grow py-10 bg-orange-200">
      <div className="container px-4 py-10 mx-auto">
        <div className="max-w-lg mx-auto">
          <div className="mb-8 text-center">
            <Link className="inline-block mx-auto mb-6" to="/">
              <img src="nigodo-assets/logo-icon-nigodo.svg" alt="" />
            </Link>
            <h2 className="mb-2 text-3xl font-extrabold md:text-4xl">
              Sign In
            </h2>
            <p className="text-lg font-extrabold leading-7 text-indigo-500">
              Find your perfect match
            </p>
          </div>
          <form onSubmit={login}>
            <InfoText message={message} />
            <div className="mb-6">
              <label className="block mb-2 font-extrabold" htmlFor="username">
                Username
              </label>
              <input
                className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow"
                type="text"
                placeholder="username"
                onChange={handleUsername}
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 font-extrabold" htmlFor="password">
                Password
              </label>
              <input
                className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow"
                type="password"
                placeholder="Password..."
                onChange={handlePassword}
                autoComplete='off'
              />
            </div>
            <div className="flex flex-wrap justify-center w-full px-4 mb-6 -mx-4 lg:w-auto">
              <p className="font-extrabold text-center">
                Forgot your password?{"  "}
                <Link className="text-indigo-500 hover:underline" to="/forgot">
                  Click Here
                </Link>
              </p>
            </div>
            <button
              type="submit"
              className="mb-6 inline-block w-full rounded border-[3px] border-indigo-900 bg-indigo-800 py-4 px-6 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-indigo-900"
            >
              Sign in
            </button>
            <p className="font-extrabold text-center">
              Don’t have an account?{"  "}
              <Link className="text-indigo-500 hover:underline" to="/register">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

Login.propTypes = {
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

Login.defaultProps = {
  itsMe: {}
}

export default Login;

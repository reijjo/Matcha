import { useState } from 'react'
import PropTypes from 'prop-types';
import axiosStuff from 'services/axiosstuff';
import InfoText from './infoText';

function useChangePw(itsMe) {
	const [passwordReg, setPasswordReg] = useState('');
	const [passwordCReg, setCPasswordReg] = useState("");
	const [message, setMessage] = useState(null)

	const handlePasswordReg = (event) => {
		setPasswordReg(event.target.value)
	}

	const handleCPasswordReg = (event) => {
		setCPasswordReg(event.target.value);
	}

	const newPasswd = (event) => {
		event.preventDefault();
		const passwd = {
			password: passwordReg,
			confPasswd: passwordCReg,
			user: itsMe.username
		}
		axiosStuff
		.newPw(passwd).then((response) => {
			setMessage(response.message)
		})
		setTimeout(() => {
			setMessage(null);
		}, 5000)
	}

	return { handlePasswordReg, handleCPasswordReg, newPasswd, message }
}



function ChangePw({ itsMe }) {
	const hook = useChangePw(itsMe);
	const {  handlePasswordReg, handleCPasswordReg, newPasswd, message } = hook;


	return (
		<section className="flex-grow py-10 bg-orange-200">
		<div className="container px-4 py-10 mx-auto">
			<div className="max-w-lg mx-auto">
				<div className="mb-8 text-center">
					<h2 className="mb-2 text-3xl font-extrabold md:text-4xl">
						New Password
					</h2>
					<p className="text-lg font-extrabold leading-7 text-indigo-500">
						Username: {itsMe.username}
					</p>
				</div>
				<InfoText message={message} />
					<form onSubmit={newPasswd} >
					<div className="mb-6">
            <label
              className="block mb-2 font-extrabold"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow"
              type="password"
              placeholder="Password..."
							id="password"
							required autoComplete="off"
						 	onChange={handlePasswordReg}
            />
          </div>
          <div className="mb-6">
            <label
              className="block mb-2 font-extrabold"
              htmlFor="password"
            >
              Confirm Password
            </label>
            <input
              className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow"
              type="password"
              placeholder="Confirm Password..."
							id="confirmPassword"
							required autoComplete="off"
						 	onChange={handleCPasswordReg}
            />
          </div>
					<button
              type="submit"
              className="mb-6 inline-block w-full rounded border-[3px] border-indigo-900 bg-indigo-800 py-4 px-6 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-indigo-900"
						>
              Change Password
          </button>
					</form>
			</div>
		</div>
		</section>
	)
}

ChangePw.propTypes = {
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

ChangePw.defaultProps = {
	itsMe: {}
}

export default ChangePw;

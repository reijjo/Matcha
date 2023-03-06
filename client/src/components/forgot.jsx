import { useState } from 'react';
import { Link } from 'react-router-dom'
import axiosStuff from 'services/axiosstuff';
import InfoText from './infoText';

function useForgot() {
	const [message, setMessage] = useState(null);
	const [email, setEmail] = useState('');

	const handleEmail = (event) => {
		setEmail(event.target.value)
	}

	const forgotEmail = (event) => {
		event.preventDefault();
		const newEmail = {
			fEmail: email
		}
		axiosStuff
		.forgot(newEmail).then((response) => {
			if (response.message)
				setMessage(response.message)
		})
		setTimeout(() => {
			setMessage(null)
		}, 5000)
	}

	return { message, handleEmail, forgotEmail }
}

function Forgot() {
	const { message, handleEmail, forgotEmail } = useForgot();

	return (
		<section className="flex-grow py-10 bg-orange-200">
		<div className="container px-4 py-10 mx-auto">
			<div className="max-w-lg mx-auto">
				<div className="mb-8 text-center">
					<Link className="inline-block mx-auto mb-6" to="/">
						<img src="nigodo-assets/logo-icon-nigodo.svg" alt="" />
					</Link>
					<h2 className="mb-2 text-3xl font-extrabold md:text-4xl">
						Forgot your password?
					</h2>
					<p className="text-lg font-extrabold leading-7 text-indigo-500">
						Enter your email and we send you a link to change your password.
					</p>
				</div>
					<InfoText message={message} />
					<div className="mb-6">
						<label className="block mb-2 font-extrabold" htmlFor="email">
							Email
						</label>
						<input
							className="inline-block w-full p-4 text-lg font-extrabold leading-6 placeholder-indigo-900 bg-white border-2 border-indigo-900 rounded shadow"
							type="email"
							placeholder="Email..."
							name='email'
							onChange={handleEmail}
						/>
					</div>
					<button
              type="submit"
              className="mb-6 inline-block w-full rounded border-[3px] border-indigo-900 bg-indigo-800 py-4 px-6 text-center text-lg font-extrabold leading-6 text-white shadow transition duration-200 hover:bg-indigo-900"
							onClick={forgotEmail}
						>
              Send Link
          </button>
			</div>
		</div>
		</section>
	)
}

export default Forgot;

import axios from "axios";
import PropTypes from 'prop-types';
import { useEffect } from "react";
// import axiosStuff from "services/axiosstuff";

function useLogout(loggedIn, setLoggedIn) {

	axios.defaults.withCredentials = true // For the sessions the work
	// console.log('eka', loggedIn)

	useEffect(() => {
		axios.get('http://localhost:3001/logout')
		// .then(() => {
			setLoggedIn(false)
		// })
		// console.log('toka', loggedIn)
		setTimeout(() => {
			window.location.replace('/');
		}, 2000)
	}, [setLoggedIn, loggedIn])
}

function Logout({ loggedIn, setLoggedIn }) {
	useLogout(loggedIn, setLoggedIn);
	// return null;
	return (
		<section className="relative flex-grow py-10 overflow-hidden bg-orange-200 lg:min-h-screen lg:py-10 relative-will-change">
		{/* <form onSubmit={registerTwo}> */}
		  <div className="container px-4 py-10 mx-auto">
        <div className="h-full overflow-hidden rounded-md border-[3px] border-indigo-900 bg-white p-6">
          <div className="pb-6 border-b border-indigo-900">
            <div className="flex flex-wrap items-center justify-between -m-2">
              <div className="w-full p-2 md:w-auto">
                <h2 className="text-lg font-semibold text-coolGray-900">
                  Logging out...
                </h2>
              </div>
             </div>
            </div>
          </div>
        </div>
      </section>
	)
};

Logout.propTypes = {
	setLoggedIn: PropTypes.func.isRequired,
	loggedIn: PropTypes.bool.isRequired


}


export default Logout;

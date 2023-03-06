import axios from "axios";
import landingPhoto from "../images/landingPhoto.jpg"
import matchaLogo from '../images/matchaLogo.png'


function Homepage() {

  axios.defaults.withCredentials = true; // sessionit toimii nyt

  return (
    <section className="flex-grow py-10 bg-orange-200">
      <div className="px-8 py-10 pt-8 pb-8">
        <div className="flex flex-wrap">
          <div className="w-full px-4 lg:w-1/2">
            <div className="pt-8 lg:max-w-lg">
              <img
                className="block object-cover w-full pt-6 pb-10 h-98 lg:h-110 xl:max-w-lg"
                src={matchaLogo}
                alt="logo"
              />
              <span className="pt-6 text-xl font-extrabold text-indigo-500 md:text-2xl">
                Join Us!
              </span>
              <h1 className="mt-1 mb-6 text-3xl font-extrabold font-heading sm:text-4xl lg:text-5xl">
                A dating app is only as good as its users.
              </h1>
              <p className="mb-10 text-xl font-extrabold leading-8 md:text-2xl">
                We’re different. Matcha is the only platform that guarantees you
                a perfect match.
              </p>
            </div>
          </div>
          <div className="w-full px-4 lg:w-1/2">
            <img
              className="h-98 lg:h-110 block w-full rounded-2xl border-[3px] border-indigo-900 object-cover shadow-lg xl:max-w-lg"
              src={landingPhoto}
              alt="landphoto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Homepage;

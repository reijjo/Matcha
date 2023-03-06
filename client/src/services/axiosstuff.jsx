import axios from "axios";

const baseUrl = "http://localhost:3001";

const login = (newObject) => {
  const req = axios.post(`${baseUrl}/login`, newObject);
  return req.then((response) => response.data);
};

const getCookie = () => {
  const req = axios.get(`${baseUrl}/login`);
  return req.then((response) => response.data);
};

const register = (newObject) => {
  const req = axios.post(`${baseUrl}/register`, newObject);
  return req.then((response) => response.data);
};

const verifyemail = () => {
  const req = axios.get(`${baseUrl}/emailverify/:hashedverify`);
  return req.then((response) => response.data);
};

const getLocationData = () => {
  const req = axios.get(`${baseUrl}/registerTwo`);
  return req.then((response) => response.data);
}

const register2 = (newObject) => {
  const req = axios.post(`${baseUrl}/registerTwo`, newObject);
  return req.then((response) => response.data);
}

const browse = () => {
	const req = axios.get(`${baseUrl}/browse`);
	return req.then((response) => response.data);
}

const profileEdit = () => {
  const req = axios.get(`${baseUrl}/profileEdit`);
  return req.then((response) => response.data)
}

const updateProfile = (newObject) => {
	const req = axios.put(`${baseUrl}/profileEdit`, newObject);
	return req.then((response) => response.data);
}

const getUser = (username) => {
	const req = axios.get(`${baseUrl}/profile/${username}`);
	return req.then((response) => response.data);
}

const addStalker = (newObject) => {
  const req = axios.post(`${baseUrl}/profile/looked/${newObject}`, newObject);
  return req.then((response) => response.data);
}

const getVisitedProfiles = () => {
  const req = axios.get(`${baseUrl}/profile/looked/:user`);
  return (req.then((response) => response.data));
}

const getStalkerProfiles = () => {
  const req = axios.get(`${baseUrl}/profile/stalked/:user`);
  return (req.then((response) => response.data));
}

const getUserCoords = () => {
	const req = axios.get(`${baseUrl}/userCoords`);
	return (req.then((response) => response.data));
}

const addPassed = (newObject) => {
  const req = axios.post(`${baseUrl}/profile/passed/${newObject}`, newObject);
  return req.then((response) => response.data);
}

const getPassed = () => {
  const req = axios.get(`${baseUrl}/profile/passed/:user`);
  return req.then((response) => response.data);
}

const addLiked = (newObject) => {
  const req = axios.post(`${baseUrl}/profile/match/:user`, newObject);
  return req.then((response) => response.data);
}

const getLiked = () => {
	const req = axios.get(`${baseUrl}/profile/liked/:user`);
	return req.then((response) => response.data);
}

const getMatches = () => {
  const req = axios.get(`${baseUrl}/profile/match/:user`);
  return req.then((response) => response.data);
}

const addMatchTable = (newObject) => {
  const req = axios.post(`${baseUrl}/matchtable/:matches`, newObject);
  return req.then((response) => response.data)
}

const getMatchedUser = (username) => {
  const req = axios.get(`${baseUrl}/match/${username}`);
  return req.then((response) => response.data);
}

const blockUser = (newObject) => {
  const req = axios.put(`${baseUrl}/block/:user`, newObject);
  return req.then((response) => response.data);
}
const unblockUser = (newObject) => {
  const req = axios.put(`${baseUrl}/unblock/:user`, newObject);
  return req.then((response) => response.data);
}

const reportUser = (newObject) => {
  const req = axios.put(`${baseUrl}/report/:user`, newObject);
  return req.then((response) => response.data);
}

const getMatchBlock = () => {
  const req = axios.get(`${baseUrl}/matchblock`);
  return req.then((response) => response.data);
}

const getWhoLiked = () => {
	const req = axios.get(`${baseUrl}/profile/who/:user`);
	return req.then((response) => response.data);
}

const getMyStatus = () => {
  const req = axios.get(`${baseUrl}/mystatus`);
  return req.then((response) => response.data);
}

const getMatchStatus = (getId) => {
  const req = axios.get(`${baseUrl}/matchstatus?id=${getId}`);
  return req.then((response) => response.data)
}

const addMessage = (newObject) => {
	const req = axios.post(`${baseUrl}/chat`, newObject)
	return req.then((response) => response.data);
}

const getMessage = () => {
	const req = axios.get(`${baseUrl}/chat`);
	return req.then((response) => response.data);
}

const addNotification = (newObject) => {
  const req = axios.post(`${baseUrl}/notifications`, newObject);
  return req.then((response) => response.data);
}

const getNotifications = () => {
  const req = axios.get(`${baseUrl}/notifications/:user`);
  return req.then((response) => response.data)
}

const updateNotif = (newObject) => {
	const req = axios.put(`${baseUrl}/notifications`, newObject);
	return req.then((response) => response.data);
}

const unLike = (removeId) => {
  const req = axios.delete(`${baseUrl}/profile/match/:user`, { data: removeId });
  return req.then((response) => response.data);
}

const addTag = (tag) => {
  const req = axios.post(`${baseUrl}/tags`, tag);
  return req.then((response) => response.data);
}

const getTag = () => {
  const req = axios.get(`${baseUrl}/tags`);
  return req.then((response) => response.data);
}

const amiblocked = () => {
  const req = axios.get(`${baseUrl}/amiblocked`);
  return req.then((response) => response.data);
}

const getMatchTable = () => {
  const req = axios.get(`${baseUrl}/matches`);
  return req.then((response) => response.data);
}

const logoutTime = (newObject) => {
  const req = axios.post(`${baseUrl}/logoutTime`, newObject);
  return req.then((response) => response.data);
};

const logout = () => {
  const req = axios.get(`${baseUrl}/logout`);
  return req.then((response) => response.data)
}

const forgot = (newObject) => {
  const req = axios.post(`${baseUrl}/forgot`, newObject);
  return req.then((response) => response.data)
}

const getForgot = (token) => {
  const req = axios.get(`${baseUrl}/get/${token}`)
  return req.then((response) => response.data)
}

const newPw = (newObject) => {
  const req = axios.put(`${baseUrl}/newPw`, newObject);
  return req.then((response) => response.data);
}

// const bigdata = () => {
// 	const req = axios.get(`${baseUrl}/bigdata`);
// 	return req.then((response) => response.data)
// }

const getImages = () => {
	const req = axios.get(`${baseUrl}/images2`);
	return req.then((response) => response.data);
};

const avatar = () => {
	const req = axios.get(`${baseUrl}/avatar2`);
	return req.then((response) => response.data);
};

const delFakeImg = (imageId) => {
  const req = axios.delete(`${baseUrl}/fakeimages2`, {data: {delete1: imageId} });
  return req.then((response) => response.data);
}

const getGoogleData = () => {
  const req = axios.get(`${baseUrl}/google`);
  return req.then((response) => response.data);
}

const axiosStuff = {
  login, getCookie, register, verifyemail, logoutTime, getLocationData,
  register2, browse, profileEdit, updateProfile, getUser, addStalker,
  getVisitedProfiles, getStalkerProfiles, getUserCoords, addPassed,
  getPassed, addLiked, getLiked, getMatches, addMatchTable,
  getMatchedUser, blockUser, unblockUser, reportUser, getMatchBlock, getWhoLiked,
  getMyStatus, getMatchStatus, addMessage, getMessage, addNotification, getNotifications,
	updateNotif, unLike, addTag, getTag, amiblocked, getMatchTable, logout, forgot,
  getForgot, newPw, getImages, avatar, delFakeImg, getGoogleData
};
export default axiosStuff;

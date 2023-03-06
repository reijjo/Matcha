require('dotenv').config()

const config = require('../src/config/config');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
// Session stuff
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// Password && hash
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const crypto = require('crypto');
let algo = 'sha256';

const nodemailer = require('nodemailer');

const pool = new Pool({
	user: config.pgUser,
	host: config.pgHost,
	database: config.pgDatabase,
	password: config.pgPassword,
	port: config.pgPort
});

const app = express();
app.use(express.json());
app.use(cors({
	origin: ['http://localhost:3000'/* , 'https://ipapi.co' */],
	methods: ['GET', 'POST', 'PUT'],
	credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
	key: 'userID',
	secret: 'BIGSECRET',
	resave: false,
	saveUninitialized: false,
	cookie: {
		expires: 1000 * 60 * 60 * 24,
		sameSite: 'Lax'
	}
}))

const router = express.Router();

router.post('/register', (req, res) => {
	const username = req.body.username.toLowerCase();
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const email = req.body.email;
	const password = req.body.password;
	const confPasswd = req.body.confPasswd;
	const verifycode = crypto.createHash(algo).update(username).digest('base64url');

	// &lt;script type='text/javascript'&gt;alert('THE GAME');&lt;/script&gt;

	if (username.length < 4 || username.length > 20)
		return res.send({ message: `Username must be between 4 - 20 characters.`})
	if (!username.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Username can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})
//password checks
	if (password.length < 8 || password.length > 20)
		return res.send({ message: `Password must be between 8 - 20 characters.`})
	if (!password.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Password can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})
	if (confPasswd.length < 8 || confPasswd.length > 20)
		return res.send({ message: `Password must be between 8 - 20 characters.`})
	if (!confPasswd.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Password can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})
	if (password !== confPasswd)
		return (res.send({ message: 'Passwords doesn\'t match.'}))
//name checks
	if (!firstname.match(/^[a-zA-Z_.-]+$/))
		return res.send({ message: 'Firstname can only have letters (a-z or A-Z) and some special characters (_.-)'})
	if (firstname.length < 2 || firstname.length > 20)
		return res.send({ message: `Firstname must be between 1 - 20 characters.`})
	if (!lastname.match(/^[a-zA-Z_.-]+$/))
		return res.send({ message: 'Lastname can only have letters (a-z or A-Z) and some special characters (_.-)'})
	if (lastname.length < 2 || lastname.length > 20)
		return res.send({ message: `Lastname must be between 4 - 20 characters.`})
// email checks
	if (!email.match(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm))
		return res.send({ message: 'Shady email.'})
	if (email.length > 40)
		return res.send({ message: `Max 40 characters on email.`})

		const sendVerifyCode = () => {
		const theMail = {
			from: config.EMAIL,
			to: email,
			subject: 'Verify your matcha account!',
			html: `
			<h3>click the link</h3><br />
			<a href="http://localhost:3001/emailverify/${verifycode}"> HERE </a><br />
			<p>Thanks.</p>`
		}

		var transporter = nodemailer.createTransport({
			//host: 'smtp.gmail.com',
			//port: 465,
			//secure: true,
			//auth: {
			//	user: 'reijjo.wow@gmail.com',
			//	pass: 'wyebczmfcexebvud'
			//}
			service: 'outlook',
			auth: {
				user: config.EMAIL,
				pass: config.EMAIL_PASSWORD
			}
		})

		transporter.sendMail(theMail, (err) => {
			if (err)
				console.log('MAIL ', err)
			// else {
			//	console.log('Email sent: ', info)
			// }
		})
	}


	pool.query('SELECT * FROM users WHERE username = $1 OR email = $2',
		[username, email],
		(err, result) => {
			if (err)
				res.send('DuplicateCHECK ', err)
			if (result.rowCount > 0) {
				// console.log('DUPCHECK RESULT', result)
				return res.send({ message: `Username / email already exists`})
			}
			else {
				bcrypt.hash(password, saltRounds, (err, hash) => {
					// console.log('HASH', hash)
					if (err)
						console.log('BCRYPT :', err);
					else {
						sendVerifyCode();
						pool.query("INSERT INTO users (username, firstname, lastname, email, password, verifycode) VALUES ($1, $2, $3, $4, $5, $6)",
						[username, firstname, lastname, email, hash, verifycode],
						(err, result) => {
						if (err)
							console.log('INSERT________ERRRORRR: ', err);
						else {
						 res.send({ message: `Registration email sent to '${email}'`, result });
					 }})
					}
				})
			}
		}
	)
})


router.get('/emailverify/:hashedverify', (req, res) => {
	const hashedverify = req.params.hashedverify;
	// console.log('HASHEDVERIFY===', hashedverify);

	pool.query('SELECT * FROM users WHERE verifycode = $1',
	[hashedverify],
	(err, result) => {
		if (err) {
			res.send(err);
			console.log('VERIFYERR ', err);
		}
		if (result.rowCount > 0) {
			pool.query('UPDATE users SET status = $1 WHERE verifycode = $2',
			[1, hashedverify])
			res.send('Email verification successfully.');
		}
		else {
			res.send('Email verification failed, link is invalid or something.');
		}
	})
})

router.post('/registerTwo', (req, res) => {
	if (req.session.user) {
		const userId = req.body.userId;
		const username = req.body.username;
		const age =  req.body.age;
		const location = req.body.location;
		//const coordinates = req.body.coordinates;
		const lng = req.body.coordinates[0];
		const lat = req.body.coordinates[1];
		const gender = req.body.gender;
		const seeking =  req.body.seeking;
		const tags = req.body.tags;
		const bio = req.body.bio;
		const firstname = req.body.firstname;
		const lastname = req.body.lastname;
		const email = req.body.email;
		const password = req.body.password;


	// age checks
		if (!Number(age)|| (age.length < 2 && age.length > 3))
			return res.send({message: `Only numbers on age field between 16-101.`})
	// location checks
		if (!location || !lng || !lat)
			return res.send({ message: `Don't mess with the location field.`});
	//gender & seeking checks
		 if (!gender || gender === 'Select One')
			return res.send({ message: `Choose your gender.`})
		if (!seeking || seeking === 'Select One')
			return res.send({ message: `Choose what you are seeking.`})
	// bio checks
		if (bio.length < 1 || bio.length > 100)
			return res.send({ message: `message length 1-100 characters thanks.` });
		if (!bio.match(/^[a-zA-Z0-9 _.!@-]+$/))
			return res.send({ message: `Only letters a-z and A-Z and numbers 0-9 and " _.!@-"`})
		pool.query(`
			INSERT INTO profile (
				user_id, username, age, location, coordinates, gender, seeking, tags, bio, firstname, lastname, email, password, fame, isonline
			) VALUES ($1, $2, $3, $4, point($5, $6), $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
			[userId, username, age, location, lng, lat, gender, seeking, tags, bio, firstname, lastname, email, password, 10, 1],
			(err, result) => {
				if (err)
					console.log('REGPART2', err);
				else {
					pool.query(`SELECT * FROM images WHERE user_id = $1`,
					[req.session.user.id],
					(err1, result1) => {
						if (err1)
							console.log('update status err', err1)
						else {
							if (result1.rowCount > 0) {
								pool.query('UPDATE users SET status = $1 WHERE username = $2',
								[3, username],
								(err2, result2) => {
									if (err2)
										console.log('update problems.', err)
									else {
										// console.log('status updated!');
										res.send({ result, result1, result2, message: `ok` })
									}
								})
							}
							else {
								pool.query('UPDATE users SET status = $1 WHERE username = $2',
								[2, username],
								(err2, result2) => {
									if (err2)
										console.log('update problems.', err)
									else {
										// console.log('status updated!');
										res.send({ result, result1, result2, message: `ok` })
									}
								})
							}
						}
					})
				}
			})
	}
	else
		res.redirect('/');
})

// some stuff so nasty people cant break our code

router.get('/registerTwo', (req, res) => {
	if (req.session.user) {
		fetch('https://ipapi.co/json').then((data) => {
			data.json().then((parsed) => {
				// console.log('huhu', parsed)
				res.send({ parsed })
			});
		});
	}
	else
		res.redirect('/');
})

// router.get('/bigdata', (req, res) => {
//   const query = req.query.query;
//   const api_key = '9417497716084e0dbb126edbc6037872';
//   const url = `https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${api_key}`;

//   fetch(url).then(data => {
// 		data.json().then((parsed) => {
//       res.send({ parsed });
// 			console.log(parsed)
// 		})
//     })
//     .catch(error => {
//       console.error('OPENCAGE', error);
//       res.status(500).send({ error });
//     });
// });


module.exports = router;

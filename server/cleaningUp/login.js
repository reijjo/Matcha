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

router.get('/login', (req, res) => {
	if (req.session.user) {
		pool.query('SELECT status FROM users WHERE username = $1',
		[req.session.user.username],
		(err, result) => {
			if (err)
				console.log('req.user.session', err);
			else {
				res.send({ loggedIn: true, user: req.session.user, result });
				// console.log('LOGINNNRESULT', result)
			}
		})
		// console.log('session', req.session.user)
	}
	else
		res.send({ loggedIn: false });
 })

 router.get('/get/:token', (req, res) => {
	const token = String(req.params.token);
	pool.query(`SELECT * FROM users WHERE verifycode = $1`,
	[token],
	(err, result) => {
		if (err)
			console.log('token err', err);
		else {
			console.log(result)
			res.send(result);
		}
	})
 })

 router.put('/newPw', (req, res) => {
	const pw = req.body.password;
	const cPw = req.body.confPasswd;
	const username = req.body.user;

	if (pw.length < 8 || pw.length > 20)
		return res.send({ message: `Password must be between 8 - 20 characters.`})
	if (!pw.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Password can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})
	if (cPw.length < 8 || cPw.length > 20)
		return res.send({ message: `Password must be between 8 - 20 characters.`})
	if (!cPw.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Password can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})
	if (pw !== cPw)
		return (res.send({ message: 'Passwords doesn\'t match.'}))

	bcrypt.hash(pw, 10, (err, hash) => {
		if (err)
			console.log('update pw hash error', err);
		else {
			pool.query(`UPDATE users SET password = $1 WHERE username = $2`,
			[hash, username],
			(err1, result1) => {
				if (err1)
					console.log('update pw err', err1);
				else {
					pool.query(`UPDATE profile SET password = $1 WHERE username = $2`,
					[hash, username],
					(err2, result2) => {
						if (err2)
							console.log('update profile pw err', err2)
						else {
							res.send({ result1, result2, message: `Password changed!` })
						}
					})
				}
			})
		}
	})
 })

router.post('/forgot', (req, res) => {
	const email = req.body.fEmail;

	pool.query(`SELECT * FROM users WHERE email = $1`,
	[email],
	(err, result) => {
	 if (err)
		 console.log('getting email err', err);
	 else {
		 if (result.rowCount === 1) {

			const sendVerif = () => {
				const verif = result.rows[0].verifycode
				const mail = {
					from: config.EMAIL,
					to: email,
					subject: `Link for changing password.`,
					html: `
						<h1>Click me!</h1> <br />
						<a href='http://localhost:3000/get/${verif}'>ME</a>
					`
				}

				var transporter = nodemailer.createTransport({
					service: 'outlook',
					auth: {
						user: config.EMAIL,
						pass: config.EMAIL_PASSWORD
					}
				})

				transporter.sendMail(mail, (err) => {
					if (err)
						console.log('forgot err', err)
					// else {
					//	console.log('forget sent: ', info)
					// }
				})
			}

			 sendVerif();
			 res.send({ result, message: `Link sended to '${email}'.`})
		 }
		 else {
			 res.send({ result, message: `no such email.`})
		 }
	 }
	})
})

router.post('/login', (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username.length < 4 || username.length > 20)
		return res.send({ message: `Username must be between 4 - 20 characters.`})
	if (!username.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Username can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})
	//password checks
	if (password.length < 8 || password.length > 20)
		return res.send({ message: `Password must be between 8 - 20 characters.`})
	if (!password.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Password can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})

	pool.query('SELECT * FROM users WHERE username = $1',
	[username],
	(err, result) => {
		if (err)
			console.log('Login', err);
		if (result.rowCount == 1) {
			bcrypt.compare(password, result.rows[0].password, (error, response) => {
				if (response) {
					if (result.rows[0].status === 0) {
						return res.send({ message: 'Verify your email thanks.'});
					}
					req.session.user = result.rows[0];
					pool.query(`UPDATE profile SET isonline = $1 WHERE username = $2`,
					[1, username],
					(err1, result1) => {
						if (err)
							console.log('isOnline ERRR', err1);
						else {
							// console.log('ISONLINEEE', result1)
						}
					})
					res.send({ result, message: `Logged in as '${username}' `});
				}
				else
					return res.send({ message: `Wrong username / password combo.` });
			})
		}
		else {
			return res.send({ message: 'User doesn\'t exist.'});
		}
	})
 })
// UPDATE users SET online=CURRENT_TIMESTAMP WHERE username='repe'

module.exports = router;

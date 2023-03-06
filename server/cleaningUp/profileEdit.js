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
	origin: ['http://localhost:3000'],
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

router.get('/profileEdit', (req, res) => {
	if (req.session.user) {
		pool.query('SELECT * FROM profile WHERE user_id = $1',
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('edit', err);
			else {
				res.send(result.rows[0]);
			}
		})
	}
	else {
		res.redirect('/');
	}
})

router.put('/profileEdit', (req, res) => {
	if (req.session.user) {
	const username = req.body.username;
	const firstname = req.body.firstname;
	const lastname = req.body.lastname;
	const email = req.body.email;
	// const password = req.body.password;
	// const confPasswd = req.body.confPasswd;
	const age = req.body.age;
	const location = req.body.location;
	const lng = req.body.coordinates[0];
	const lat = req.body.coordinates[1];
	const gender = req.body.gender;
	const seeking = req.body.seeking;
	const tags = req.body.tags;
	const bio = req.body.bio;

	if (username.length < 4 || username.length > 20)
		return res.send({ message: `Username must be between 4 - 20 characters.`})
	if (!username.match(/^[a-zA-Z0-9_.!@-]+$/))
		return res.send({ message: 'Username can only have letters (a-z or A-Z), numbers (0-9) and some special characters (_.!#@-)'})
	// name checks
	if (!firstname.match(/^[a-zA-Z_.-]+$/))
		return res.send({ message: 'Firstname can only have letters (a-z or A-Z) and some special characters (_.-)'})
	if (firstname.length < 2 || firstname.length > 20)
		return res.send({ message: `Firstname must be between 1 - 20 characters.`})
	if (!lastname.match(/^[a-zA-Z_.-]+$/))
		return res.send({ message: 'Lastname can only have letters (a-z or A-Z) and some special characters (_.-)'})
	if (lastname.length < 2 || lastname.length > 20)
		return res.send({ message: `Lastname must be between 4 - 20 characters.`})
	// age checks
	if (!Number(age)|| (age.length < 2 && age.length > 3))
		return res.send({message: `Only numbers on age field between 16-101.`})
	// location checks
	if (!location || !lng || !lat)
		return res.send({ message: `Don't mess with the location field.`})
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

	// AND OTHER CHECKS!!!
	pool.query('SELECT * FROM users WHERE username = $1 OR email = $2',
	[username, email],
	(err, result) => {
		if (err)
			console.log('update', err);
		if (result.rowCount > 0 && result.rows[0].username !== req.session.user.username && result.rows[0].email !== req.session.user.email) {
			// console.log('update duplicate', result);
			return res.send({ message: `Username / email already exists`, result })
		}
		else {
			pool.query(`SELECT * FROM images WHERE user_id = $1`,
			[req.session.user.id],
			(err, result) => {
				if (err)
					console.log('userid from images err', err)
				else {
					if (result.rowCount > 0) {
						pool.query(`UPDATE profile SET username = $1, firstname = $2, lastname = $3,
						email = $4, age = $5, location = $6, coordinates = point($7, $8),
						gender = $9, seeking = $10, tags = $11, bio = $12 WHERE user_id = $13`,
						[username, firstname, lastname, email, age, location, lng, lat,
							gender, seeking, tags, bio, req.session.user.id],
						(err1, result1) => {
							if (err1)
								console.log('UPDATE PROFILE', err)
							else {
								pool.query(`UPDATE users SET username = $1, firstname = $2, lastname = $3,
								email = $4, status = $5 WHERE id = $6`,
								[username, firstname, lastname, email, 3, req.session.user.id])
								res.send({ message: 'profile updated.', result, result1 })
							}
						})
					}
					else {
						pool.query(`UPDATE profile SET username = $1, firstname = $2, lastname = $3,
						email = $4, age = $5, location = $6, coordinates = point($7, $8),
						gender = $9, seeking = $10, tags = $11, bio = $12 WHERE user_id = $13`,
						[username, firstname, lastname, email, age, location, lng, lat,
							gender, seeking, tags, bio, req.session.user.id],
						(err1, result1) => {
							if (err1)
								console.log('UPDATE PROFILE', err)
							else {
								pool.query(`UPDATE users SET username = $1, firstname = $2, lastname = $3,
								email = $4, status = $5 WHERE id = $6`,
								[username, firstname, lastname, email, 2, req.session.user.id])
								res.send({ message: 'profile updated.', result, result1 })
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

module.exports = router;

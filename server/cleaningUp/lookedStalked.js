require('dotenv').config()

const config = require('../src/config/config');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const request = require('request');
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

router.post('/profile/looked/:user', (req, res) => {
	if (req.session.user) {
		const stalkedID = Number(req.body.stalked_id);
		pool.query(`SELECT * FROM stalkers WHERE user_id = $1 AND stalked_id = $2`,
		[req.session.user.id, stalkedID],
		(err2, result2) => {
			if (err2)
				console.log('DUBCHECK stalkers', err2);
			else if (result2.rowCount > 0) {
				// console.log('Already Checked')
				res.sendStatus(200);
			}
			else {
				pool.query(`INSERT INTO stalkers (user_id, stalked_id) VALUES ($1, $2)`,
				[req.session.user.id, stalkedID],
				(err, result) => {
					if (err)
						console.log('STALKER insert', err);
					else {
						// res.sendStatus(200);
						res.send(result)
						// console.log('STALKER INSERT', result.rowCount);
					}
				})
			}
		})
	}
	else {
		res.redirect('/');
	}
})


router.get('/profile/looked/:user', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT username FROM profile WHERE user_id IN
		(SELECT stalked_id FROM stalkers WHERE user_id = $1)`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('getting visited profiles error', err);
			else {
				res.send(result);
			}
		})
	}
	else {
		res.redirect('/')
	}
	})

	router.get('/profile/stalked/:user', (req, res) => {
		if (req.session.user) {
			pool.query(`SELECT username FROM profile WHERE user_id IN
			(SELECT user_id FROM stalkers WHERE stalked_id = $1)`,
			[req.session.user.id],
			(err, result) => {
				if (err)
					console.log('getting stalked profiles error', err);
				else {
					res.send(result);
				}
			})
		}
		else {
			res.redirect('/')
		}
	})

	module.exports = router;

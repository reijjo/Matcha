require('dotenv').config()

const config = require('../src/config/config');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
// Session stuff
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');


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

router.get('/profile/passed/:user', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT passed_id FROM passed WHERE user_id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('Getting passed', err);
			else {
				res.send(result);
			}
		})
	}
	else {
		res.redirect('/')
	}
})

router.post('/profile/passed/:user', (req, res) => {
	const passedID = Number(req.body.passed_id);
	// console.log('PASSED ID', passedID);
	pool.query(`SELECT * FROM passed WHERE user_id = $1 AND passed_id = $2`,
	[req.session.user.id, passedID],
	(err, result) => {
		if (err)
			console.log('Pass check', err);
		else if (result.rowCount > 0)
			console.log('already passed');
		else {
			pool.query(`INSERT INTO passed (user_id, passed_id) VALUES ($1, $2)`,
			[req.session.user.id, passedID],
			(err2, result2) => {
				if (err2)
					console.log('Insert passed ', err)
				else {
					res.sendStatus(200);
					// console.log('PASSED INSERT', result2.rowCount)
				}
			})
		}
	})
})

module.exports = router;

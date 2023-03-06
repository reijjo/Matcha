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

router.get('/userCoords', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT coordinates FROM profile WHERE user_id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('getting coords', err)
			else {
				res.send(result.rows[0]);
			}
		})
	}
	else {
		res.redirect('/')
	}
})

module.exports = router;

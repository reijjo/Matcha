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
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

 router.get('/notifications/:user', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT * FROM notifications WHERE to_id = $1 AND read = $2`,
		[req.session.user.id, 0],
		(err, result) => {
			if (err)
				console.log('notif error')
			else if (result.rowCount > 0) {
				res.send(result)
				// console.log('notif result', result.rows)
			}
			else {
				res.send(result)
			}
		})
	}
	else
		res.redirect('/')

 })

 router.post('/notifications', (req, res) => {
	const sender = req.body.sender_id;
	const to = req.body.to_id;
	const message = req.body.message;
	pool.query(`INSERT INTO notifications (sender_id, to_id, message) VALUES ($1, $2, $3)`,
	[sender, to, message],
	(err, result) => {
		if (err)
			console.log('INSERT NOTF ERR', err)
		else {
			// console.log('NOTFFF', result.rowCount)
			res.send(result)
		}
	})
 })

router.put('/notifications', (req, res) => {
	const notif_id = req.body.notif_id
	// console.log('NOTIFID', notif_id)
	pool.query(`UPDATE notifications SET read = $1 WHERE id = $2`,
	[1, notif_id],
	(err, result) => {
		if (err)
			console.log('update notification', err)
		else {
			// console.log('UPDATA NOTIFICATONS', result.rows);
			res.send(result);
		}
	})
 })

 router.post('/chat', (req, res) => {
	const sender = req.body.sender_id;
	const to = req.body.to_id;
	const message = req.body.message;

	if (message.length < 1 || message.length > 100)
		return res.send({ message: `message length 1-100 characters thanks.` });
	if (!message.match(/^[a-zA-Z0-9 _.!@-]+$/))
		return res.send({ message: `Only letters a-z and A-Z and numbers 0-9 and " _.!@-"`})

	pool.query(`INSERT INTO messages (sender_id, to_id, message) VALUES ($1, $2, $3)`,
	[sender, to, message],
	(err , result) => {
		if (err)
			console.log('INSERT MSG ERR', err)
		else {
			// console.log(result.rowCount);
			res.send(result)
		}
	})
 })

router.get('/chat', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT * FROM messages WHERE sender_id = $1 OR to_id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('gettinf msg err', err);
			else {
				// console.log('TAMA MOI HALOO', result.rows)
				res.send(result.rows)
			}
		})
	}
	else {
		res.redirect('/');
	}
 })

 module.exports = router;

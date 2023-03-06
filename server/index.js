require('dotenv').config()
const config = require('./src/config/config');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
// Session stuff
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
// images
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto')

const pool = new Pool({
	user: config.pgUser,
	host: config.pgHost,
	database: config.pgDatabase,
	password: config.pgPassword,
	port: config.pgPort,
	max: 30
});

const connectDB = () => {
	pool.connect((err, client, release) => {
		if (err) {
			console.log('Error acquiring client', err.stack);
			console.log('Retrying in 5 seconds...');
			setTimeout(connectDB, 5000);
		}
		else {
			console.log("Connected to database.");
		}
	})
}

connectDB();

const app = express();
app.use(express.json());

const router = express.Router();
app.use(express.static('public'))
router.use(express.static('public'))

// SOCKET SERVER ETC
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
	cors: {
		origin: ['http://localhost:3000'],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true
	}
})

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

const allLogin = require('./cleaningUp/login');
app.use(allLogin)

const allRegister = require('./cleaningUp/register');
app.use(allRegister);

const allProfileEdit = require('./cleaningUp/profileEdit');
app.use(allProfileEdit)

const allLookStalk = require('./cleaningUp/lookedStalked');
app.use(allLookStalk);

const allUserCoords = require('./cleaningUp/userCoords');
app.use(allUserCoords);

const allPassed = require('./cleaningUp/pass');
app.use(allPassed);

const allMatched = require('./cleaningUp/match');
app.use(allMatched);

const allChatNotif = require('./cleaningUp/chatNotif');
app.use(allChatNotif);

 const allImages = require('./cleaningUp/images');
 app.use(allImages);


app.get('/', (req, res) => {
	// res.send(`
	// 	<!DOCTYPE html>
	// 	<h2>hi from the back!!!@! SERVER</h2>`
	// );
	res.sendStatus(200)
})

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// console.log(req.session);
		const userid = req.session.user.id
		const userDir = path.join(__dirname, 'public', 'upload', `${userid}`);
		if (!fs.existsSync(userDir)) {
			fs.mkdirSync(userDir);
		}
		cb(null, userDir);
	},
	filename: (req, file, cb) => {
		// console.log(req.session);
		const { user } = req.session;
		const date = new Date().toISOString().split('T')[0];
		const match = date.match(/(\d{4})-(\d{2})-(\d{2})/);
		const year = match[1];
		const month = match[2];
		const day = match[3];
		const formattedDate = `${day}-${month}-${year}`;
		// console.log(formattedDate); // Outputs something like "02-01-2022"
		const uniqueString = crypto.randomBytes(2).toString('hex');

		cb(
			null,
			`user-${user.id}-date-${formattedDate}-${uniqueString}.${
				file.mimetype.split('/')[1]
			}`
		);
	},
});

const upload = multer({ storage: storage });

 app.post('/upload/', upload.array('image', 5), async (req, res) => {
	const session = req.session;
	const user = req.session.user;
	const userID = user.id;
	const imagePaths = req.files.map(
		(file) =>
			`${req.protocol}://${req.get('host')}/upload/${userID}/${
				file.filename
			}`
	);

	// validate imagepaths array to make sure it only contains strings that are valid file paths, if not, return an error response, if so, continue with the rest of the code
	if (imagePaths.some((path) => typeof path !== 'string')) {
		return res.status(400).json({ error: 'Invalid file path.' });
		// console.log('invalid file path');
	}

	if (session.user) {
		const userID = user.id;
		 try {
			// Check if the user has already uploaded 5 images
			const result = await pool.query(
				'SELECT COUNT(*) FROM images WHERE user_id = $1',
				[userID]
			);
			const count = parseInt(result.rows[0].count, 10);
			// console.log('count', count)
			if (count >= 5) {
				// return res
				//	.status(400)
				//	.json({ error: 'You can only upload 5 images.' });
				res.send({ message: `You can only upload 5 images`, result })
			}
			else {
				const maxId = await pool.query('SELECT MAX(id) FROM images');
				// console.log(maxId.rows[0].max);
				const nextId = parseInt(maxId.rows[0].max, 10) + 1;
				// console.log(nextId);

				// Insert new rows with the image file paths
				await pool.query(
					`INSERT INTO images(id, user_id, path, created_at) VALUES ${imagePaths
						.map((_, i) => `(${nextId}, $1, $${i + 2}, NOW())`)
						.join(',')}`,
					[userID, ...imagePaths]
				);
				res.json({ message: 'Success' });

			}

			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal Server Error' });
			 }
}});

app.post('/logoutTime', (req, res) => {
	if (req.session.user) {
		const logoutuser = req.body.logoutuser
		// console.log('LOGOUTUSERR', logoutuser)
		// console.log('EKA LOGOUTISTA', req.session.user.username)
		pool.query(`UPDATE profile SET isonline = $1, online = now() WHERE username = $2`,
		[0, logoutuser],
		(err, result) => {
			if (err)
				console.log('ISONLINE LOGOUT STATUSUPDATE ERR', err)
			else {
				// console.log('ONLINE TO ZERO OK');
				// console.log('ONLINE TO ZERO RESULT', result)
				res.redirect('/logout')
			}
		})
	}
	else {
		res.redirect('/');
	}
})

app.get('/logout', (req, res) => {
		req.session.destroy((err, result) => {
		if (err) {
			console.error(err);
			res.sendStatus(500);
		}
		else {
			// console.log('aferrlogout', req.session);
			// res.clearCookie('userID');
			// res.send({ message: 'Session destroyed' })
			// res.redirect('/')
			// res.send(result)
			res.sendStatus(200)
		}
	})
}
)

// BROWSING PROFILES etc
app.get('/browse', (req, res) => {
	if (req.session.user) {
		pool.query('SELECT * FROM profile WHERE username != $1 ORDER BY RANDOM()',
		[req.session.user.username],
		(err, result) => {
			if (err)
				console.log('query ', err);
			else {
				res.send(result)
			}
		})
	}
	else
		res.redirect('/');
})

app.get('/profile/:user', (req, res) => {
	if (req.session.user) {
		const username = String(req.params.user)
		// console.log('BACK/:USER', req.params.user)
		pool.query(`SELECT * FROM profile WHERE username = $1`,
		[username],
		(err, result) => {
			if (err)
				console.log('/profile/:user', err);
			 else if (result.rowCount !== 1) {
				// console.log('EI OSUNU NYT');
				res.send({ realUser: false });
			 }
			else {
				// console.log('/profile/:user ', result.rows)
				res.send(result.rows[0]);
			}
		})
	}
	else
		res.redirect('/')
})

app.get('/tags', (req, res) => {
	pool.query(`SELECT * FROM tags`,
	(err, result) => {
		if (err)
			console.log('Getting tags', err)
		else {
			// console.log('TAAAAGS', result.rowCount);
			res.send(result);
		}
	})
})

app.post('/tags', (req, res) => {
	const tag = req.body.text
	// console.log('TAGI', tag)
	if (!tag.match(/^[a-z0-9]+$/)) {
		return res.send({ message: 'Only letters a-z and numbers 0-9.'})
	}
	else {
		pool.query(`SELECT * FROM tags WHERE tag = $1`,
		[tag],
		(err1, result1) => {
			if (err1)
				console.log('TAG DUP CHECK ERR', err1)
			else if (result1.rowCount > 0) {
				// console.log('TAG used', result1.rowCount)
				res.send(result1)
			}
			else {
				pool.query(`INSERT INTO tags (tag) VALUES ($1)`,
				[tag],
				(err, result) => {
					if (err)
						console.log('TAG ADDING ERR', err)
					else {
						// console.log('TAGRESULT', result.rowCount);
						res.send(result)
					}
				})
			}
		})
	}
})


 const unknownEndpoint = (request, response) => {
	response.status(404).send({
		error: 'unknown endpoint'
	})
 }
 app.use(unknownEndpoint)

const { PORT } = require('./src/config/config');
server.listen(config.PORT, () => {
	console.log(`Server on port ${PORT}`);
})


io.on('connection', (socket => {
	// console.log('socket.id', socket.id)

	socket.on('join_room', (data) => {
		socket.join(data);
		// console.log('user joined room: ', data);
	})

	socket.on('send_message', (data) => {
		// console.log('sendmessagedata', data)
		socket.to(data.room).emit('recieve_message', data.content)
	})

	socket.on('send_notification', (data) => {
		// console.log('notificationdata', data)
		socket.to(data.room).emit('recieve_notification', data.content)
	})

	socket.on('disconnected', () => {
		console.log('User disconnected.');
	})
}))

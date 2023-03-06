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
	origin: ['http://localhost:3000'],
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

router.get('/matches', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT * FROM matches WHERE user_id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('MATCHESSS ERROR', err)
			else {
				res.send(result)
			}
		})
	}
	else
		res.redirect('/');
})

router.get('/profile/liked/:user', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT * FROM profile WHERE user_id IN
		(SELECT match_id FROM matchblock WHERE user_id = $1)`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('Getting liked ', err);
			else if (result.rowCount > 0) {
				res.send(result)
			}
			else {
				res.send(result)
				// console.log('no matches')
			}
		})
	}
	else {
		res.redirect('/')
	}
})

router.get('/profile/who/:user', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT * FROM profile where user_id IN (SELECT user_id FROM matchblock WHERE match_id = $1)`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('Getting wholiked ', err);
			else if (result.rowCount > 0) {
				res.send(result)
				// console.log('wholiked', result.rows)
			}
			else {
				res.send(result)
				// console.log('no matches')
			}
		})
	}
	else {
		res.redirect('/')
	}
})

router.get('/match/:user', (req, res) => {
	const username = String(req.params.user)
	pool.query(`SELECT * FROM profile WHERE username = $1`,
	[username],
	(err, result) => {
		if (err)
			console.log('/match/:user', err)
		else if (result.rowCount !== 1)
			res.send({ realUser: false })
		else {
			// console.log('match/:user', result.rows)
			res.send(result.rows[0])
		}
	})
})

router.get('/profile/match/:user', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT p.* FROM profile p
		INNER JOIN matchblock m1 ON p.user_id = m1.match_id
		INNER JOIN matchblock m2 ON m1.user_id = m2.match_id AND
		m1.match_id = m2.user_id WHERE m1.user_id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err) {
				console.log('match check error', err)
				res.status(500).send({ error: 'match error' })
			}
			else if (result.rowCount === 0) {
				// console.log('No matches found')
				res.status(200).send({ message: 'no matches', result })
			}
			else {
				// console.log('TAMA', result)
				res.status(200).send(result)
			}
		})
	}
	else {
		res.redirect('/')
	}
})

router.get('/matchblock', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT * FROM matchblock WHERE user_id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('matchblock', err);
			else {
				res.send(result)
			}
		})
	}
	else {
		res.redirect('/')
	}
})

router.get('/amiblocked', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT user_id FROM matchblock WHERE match_id = $1 AND block_id = $1 OR report_id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('amiblocked ERR', err)
			else {
				res.send(result);
				}
		})
	}
	else {
		res.redirect('/')
	}
})

router.get('/mystatus', (req, res) => {
	if (req.session.user) {
		pool.query(`SELECT status FROM users WHERE id = $1`,
		[req.session.user.id],
		(err, result) => {
			if (err)
				console.log('mystatus ', err);
			else {
				res.send(result);
				// console.log('mystatus', result);
			}
		})
	}
	else {
		res.redirect('/')
	}
})

 router.get('/matchstatus', (req, res) => {
	pool.query(`SELECT status FROM users WHERE id = $1`,
	[req.query.id],
	(err, result) => {
		if (err)
			console.log('matchstatus ', err);
		else {
			res.send(result);
			// console.log('ONKO RESULTTIA', result.rows)
		}
	})
 })

router.delete('/profile/match/:user', (req, res) => {
	if (req.session.user) {
		const userId = req.body.user_id;
		const removeId = req.body.remove_id;
		pool.query(`DELETE FROM matches WHERE user_id = $1 AND match_id = $2`,
		[userId, removeId],
		(err, result) => {
			if (err)
				console.log('MATCHDEL ERR', err)
			else {
				 pool.query(`DELETE FROM matches WHERE user_id = $1 AND match_id = $2`,
				 [removeId, userId],
				 (err1, result1) => {
					if (err1)
						console.log('MATCHTABLE DEL ERR', err1)
					else {
						// pool.query(`DELETE FROM matchblock WHERE user_id = $1 AND match_id = $2`,
						// [blockId, req.session.user.id]);
						pool.query(`DELETE FROM matchblock WHERE user_id = $2 AND match_id = $1`,
						[removeId, userId],
						(err2, result2) => {
							if (err2)
								console.log('PART2 DEL MATCH', err2)
							else {
								res.send({ result, result1, result2 })
							}
						});
						}
				 })
				}
		})
	}
	else {
		res.redirect('/');
	}
})

router.post('/profile/match/:user', (req, res) => {
	if (req.session.user) {
		const likedID = Number(req.body.match_id);
		// console.log('MATCH ID', likedID);
		pool.query(`SELECT * FROM matchblock WHERE user_id = $1 AND match_id = $2`,
		[req.session.user.id, likedID],
		(err, result) => {
			if (err)
				console.log('match check', err);
			else if (result.rowCount > 0) {
				// console.log('Already matched');
				res.send(result)
			}
			else {
				let itsamatch = false;
				pool.query(`SELECT * FROM matchblock WHERE user_id = $1 AND match_id = $2`,
				[likedID, req.session.user.id],
				(err2, result2) => {
					if (err2)
						console.log('match check', err2)
					else if (result2.rowCount > 0) {
						itsamatch = true;
						//r es.send(result2)
					}
					pool.query(`INSERT INTO matchblock (user_id, match_id) VALUES ($1, $2)`,
					[req.session.user.id, likedID],
					(err3, result3) => {
						if (err3)
							console.log('insert liked ERR', err3)
						else {
							// console.log('MATCH INSERT', result3.rowCount)
							res.send({ result, result2, result3, itsamatch})
						}
					}
					)
				})
			}
		})
	}
	else {
		res.redirect('/');
	}
})

router.post('/matchtable/:matches', (req, res) => {
	if (req.session.user) {
		const matchId = req.body.match_id
		// console.log('MATCCHCHID', matchId)
		pool.query(`SELECT * FROM matches WHERE user_id = $1 AND match_id = $2`,
		[req.session.user.id, matchId],
		(err, result) => {
			if (err)
				console.log('dupcheckerr', err);
			else if (result.rowCount === 0) {
				pool.query(`INSERT INTO matches (user_id, match_id) VALUES ($1, $2), ($2, $1)`,
				[req.session.user.id, matchId])
				pool.query(`UPDATE profile SET fame = fame + $1 WHERE user_id IN ($2, $3)`,
				[2, req.session.user.id, matchId])
				res.send(result)
			}
			else {
				res.send(result)
			}
		})
	}
	else {
		res.redirect('/');
	}
})

router.put('/block/:user', (req, res) => {
	const userId = Number(req.body.user_id);
	const blockId = Number(req.body.block_id);
	pool.query(`UPDATE matchblock SET block_id = $1 WHERE user_id = $2 AND match_id = $3`,
	[blockId, userId, blockId],
	(err, result) => {
		if (err)
			console.log('block err', err)
		else {
			pool.query(`UPDATE profile SET fame = fame - $1 WHERE user_id = $2`,
			[2, blockId])
			res.send(result);
			// console.log(result);
		}
	})
})

router.put('/unblock/:user', (req, res) => {
	const userId = Number(req.body.user_id);
	const blockId = Number(req.body.block_id);
	pool.query(`UPDATE matchblock SET block_id = $1 WHERE user_id = $2 AND match_id = $3`,
	[0, userId, blockId],
	(err, result) => {
		if (err)
			console.log('block err', err)
		else {
			pool.query(`UPDATE profile SET fame = fame + $1 WHERE user_id = $2`,
			[2, blockId])
			res.send(result);
			// console.log(result);
		}
	})
})

router.put('/report/:user', (req, res) => {
	const userId = Number(req.body.user_id);
	const blockId = Number(req.body.block_id);
	pool.query(`UPDATE matchblock SET report_id = $1 WHERE user_id = $2 AND match_id = $3`,
	[blockId, userId, blockId],
	(err, result) => {
		if (err)
			console.log('block err', err)
		else {
			pool.query(`UPDATE profile SET fame = fame - $1 WHERE user_id = $2`,
			[2, blockId])
			res.send(result);
			// console.log(result);
		}
	})
})


module.exports = router;

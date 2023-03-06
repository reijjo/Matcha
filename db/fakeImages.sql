INSERT INTO images (id, user_id, path, avatar)
SELECT i as id,
	i + 10 as user_id,
	'http://localhost:3001/images/user-5.jpg' as path,
	TRUE as avatar
FROM generate_series(1, 500) as i;

INSERT INTO images (id, user_id, path, avatar)
SELECT i + 500 as id,
	i + 10 as user_id,
	'http://localhost:3001/images/user-2.jpg' as path,
	FALSE as avatar
FROM generate_series(1, 500) as i;

INSERT INTO images (id, user_id, path, avatar)
SELECT i + 1000 as id,
	i + 10 as user_id,
	'http://localhost:3001/images/user-3.jpg' as path,
	FALSE as avatar
FROM generate_series(1, 500) as i;

INSERT INTO images (id, user_id, path, avatar)
SELECT i + 1500 as id,
	i + 10 as user_id,
	'http://localhost:3001/images/user-4.jpg' as path,
	FALSE as avatar
FROM generate_series(1, 500) as i;

INSERT INTO images (id, user_id, path, avatar)
SELECT i + 2000 as id,
	i + 10 as user_id,
	'http://localhost:3001/images/user-1.jpg' as path,
	FALSE as avatar
FROM generate_series(1, 500) as i;

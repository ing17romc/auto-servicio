
const getConfig = () => {
	const DEV = process.env.NODE_ENV !== 'production'

	if (DEV) {
		return {
			host: process.env.DEV_MYSQL_HOST,
			port: process.env.DEV_MYSQL_PORT,
			database: process.env.DEV_MYSQL_DATABASE,
			user: process.env.DEV_MYSQL_USER,
			password: process.env.DEV_MYSQL_PASSWORD
		}
	} else {
		return process.env.DATABASE_URL
	}
}

function connection () {
	try {
		const mysql = require('mysql2')

		const config = getConfig()

		const pool = mysql.createPool(config)

		const promisePool = pool.promise()

		return promisePool
	} catch (error) {
		return console.log(`Could not connect - ${error}`)
	}
}

const pool = connection()

module.exports = {
	connection: async () => pool.getConnection(),
	execute: (...params) => pool.execute(...params),
	query: (...params) => pool.query(...params)
}

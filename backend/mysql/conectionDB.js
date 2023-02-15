function connection () {
	try {
		const mysql = require('mysql2')

		const config = {
			host: process.env.MYSQL_HOST,
			port: process.env.MYSQL_PORT,
			database: process.env.MYSQL_DATABASE,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASSWORD
		}

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

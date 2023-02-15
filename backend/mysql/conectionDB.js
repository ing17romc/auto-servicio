const DEV_MYSQL_HOST = process.env.DEV_MYSQL_HOST
const DEV_MYSQL_PORT = process.env.DEV_MYSQL_PORT
const DEV_MYSQL_DATABASE = process.env.DEV_MYSQL_DATABASE
const DEV_MYSQL_USER = process.env.DEV_MYSQL_USER
const DEV_MYSQL_PASSWORD = process.env.DEV_MYSQL_PASSWORD

const PROD_MYSQL_HOST = process.env.PROD_MYSQL_HOST
const PROD_MYSQL_PORT = process.env.PROD_MYSQL_PORT
const PROD_MYSQL_DATABASE = process.env.PROD_MYSQL_DATABASE
const PROD_MYSQL_USER = process.env.PROD_MYSQL_USER
const PROD_MYSQL_PASSWORD = process.env.PROD_MYSQL_PASSWORD

function connection () {
	const DEV = process.env.NODE_ENV !== 'production'

	try {
		const mysql = require('mysql2')

		const config = {
			host: DEV ? DEV_MYSQL_HOST : PROD_MYSQL_HOST,
			port: DEV ? DEV_MYSQL_PORT : PROD_MYSQL_PORT,
			database: DEV ? DEV_MYSQL_DATABASE : PROD_MYSQL_DATABASE,
			user: DEV ? DEV_MYSQL_USER : PROD_MYSQL_USER,
			password: DEV ? DEV_MYSQL_PASSWORD : PROD_MYSQL_PASSWORD,
			dialectOptions: {
				ssl: {
					rejectUnauthorized: true
				}
			}
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

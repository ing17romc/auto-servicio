const db = require('./conectionDB')

export async function excuteQuery ({ query, params = [] }) {
	try {
		// const connection = await mysql.createConnection(config);
		const [rows] = await db.execute(query, params)
		return rows
	} catch (error) {
		return { error }
	}
}

export async function excuteSP (sp) {
	try {
		// const connection = await mysql.createConnection(config);
		const [rows] = await db.query(sp)
		if (rows && rows[0].length) return rows[0]
		else return []
	} catch (error) {
		return { error }
	}
}

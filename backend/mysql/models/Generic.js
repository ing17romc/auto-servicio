import {
	// excuteSP,
	excuteQuery
} from '../db'

export const find = async (SP, getEntities) => {
	console.log(SP)
	try {
		// const data = await excuteSP(SP);
		const data = await excuteQuery({ query: SP })
		console.log(data)
		return getEntities(data)
	} catch (error) {
		console.log(error)
		return []
	}
}

export const save = async (params, SP) => {
	console.log(SP)
	console.log(params)

	try {
		const result = await excuteQuery({
			query: SP,
			params
		})
		return result && result.affectedRows === 1
	} catch (error) {
		console.log(error)
		return false
	}
}

export const findById = async (id, SP, getEntity) => {
	console.log(SP)
	try {
		const data = await excuteQuery({ query: SP, params: [id] })
		console.log(data)
		return getEntity(data)
	} catch (error) {
		console.log(error)
		return null
	}
}

export const update = async (params, SP) => {
	console.log(SP)
	try {
		const result = await excuteQuery({
			query: SP,
			params
		})
		return result && result.affectedRows === 1
	} catch (error) {
		console.log(error)
		return false
	}
}

export const deleteById = async (id, SP) => {
	console.log(SP)
	try {
		const result = await excuteQuery({ query: SP, params: [id] })
		return result && result.affectedRows === 1
	} catch (error) {
		console.log(error)
		return false
	}
}

import { CODE_HTTP } from 'constants/index'

export const get_all_generic = async (res, func) => {
	try {
		const data = await func()
		console.log('GET', data)
		return res.status(CODE_HTTP._200).json({ data })
	} catch (error) {
		return res.status(CODE_HTTP._400).json({ error: error.message })
	}
}

export const post_generic = async (res, json, func) => {
	try {
		const result = await func(json)
		console.log('POST', result)
		if(result)
			return res.status(CODE_HTTP._201).json({ msg: 'Created!' })
		else 
			return res.status(CODE_HTTP._400).json({ msg: 'Could not create element!' })
	} catch (error) {
		return res.status(CODE_HTTP._400).json({ error: error.message })
	}
}

export const get_id_generic = async (res, id, func) => {
	try {
		const data = await func(id)
		console.log('GET', data)
		if (data) {
			return res.status(CODE_HTTP._200).json(data)
		} else {
			return res
				.status(CODE_HTTP._404)
				.json({ msg: 'Element does not exists' })
		}
	} catch (error) {
		return res.status(CODE_HTTP._500).json({ error: error.message })
	}
}

export const put_generic = async (res, json, func) => {
	try {
		const result = await func(json)
		console.log('PUT', result)
		if (result) {
			return res.status(CODE_HTTP._200).json({ msg: 'Updated!' })
		} else {
			return res
				.status(CODE_HTTP._404)
				.json({ msg: 'Element does not exists' })
		}
	} catch (error) {
		return res.status(CODE_HTTP._400).json({ error: error.message })
	}
}

export const delete_generic = async (res, id, func) => {
	try {
		const result = await func(id)
		console.log('DELETE', result)
		if (result) {
			return res.status(CODE_HTTP._200).json({ msg: 'Deleted!' })
		} else {
			return res
				.status(CODE_HTTP._404)
				.json({ msg: 'Element does not exists' })
		}
	} catch (error) {
		return res.status(CODE_HTTP._500).json({ error: error.message })
	}
}

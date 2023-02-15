
import { STATUS } from '../constants'

export const getStatus = (value) => (value ? STATUS[1].value : STATUS[0].value)

export const getGenericEntities = (list) => {
	const data = []
	list.forEach((row) =>
		data.push({
			id: row.id,
			nombre: row.nombre,
			estado: row.estado
		})
	)
	return data
}

export const getGenericEntity = (data) => {
	if (data.length) {
		return {
			id: data[0].id,
			nombre: data[0].nombre,
			estado: data[0].estado
		}
	} else {
		return null
	}
}

export const deleteElement = async (id, api, path, router) => {
	try {
		await fetch(`${api}/${id}`, {
			method: 'DELETE'
		})
		router.push(`${path}`)
	} catch (error) {
		console.error(error)
	}
}

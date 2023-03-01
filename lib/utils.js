
import { STATUS } from '../constants'

export const getStatus = (value) => (value ? STATUS[1].value : STATUS[0].value)

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

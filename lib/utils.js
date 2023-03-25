
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

export const numberFormat = (number) => {
	return new Intl.NumberFormat('es-MX').format(number)
}

export const getBreadcrumb = (router) => {
	const options = []
	const path = router.asPath

	// console.log('router', router)
	// console.log('router.asPath', path)
	const array = path.split('/')
	// console.log('router.asPath-array', array)
	let string = ''
	array.forEach(element => {
		if (element) {
			string += `/${element}`
			options.push({ url: string, text: element })
		}
	})
	return options
}

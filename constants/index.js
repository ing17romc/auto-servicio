import { CONFIG } from 'config'
import { CONTENT } from 'content'

const { CERO_HUMEDAD, WALMART, START_APP, EXIT_APP } = CONFIG.ROUTER
const { GENERIC } = CONTENT

export const TABLE_HEADERS = [GENERIC.ID, GENERIC.NAME, GENERIC.STATUS.NAME]

export const STATUS = [
	{ key: '0', value: GENERIC.STATUS.INACTIVE },
	{ key: '1', value: GENERIC.STATUS.ACTIVE }
]

export const LEFT_OPTIONS = [{ path: START_APP, name: GENERIC.MENU }]
export const RIGHT_OPTIONS = [{ path: EXIT_APP, name: GENERIC.EXIT }]

export const MENU_OPTIONS = [
	{ path: CERO_HUMEDAD.BASE, name: CONTENT.CERO_HUMEDAD.TITLE, icon: 'list' },
	{ path: WALMART.BASE, name: CONTENT.WALMART.TITLE, icon: 'list' }
]

export const MENU_CERO_HUMEDAD = [
	{ path: CERO_HUMEDAD.BASE + CERO_HUMEDAD.PRODUCTOS, name: CONTENT.CERO_HUMEDAD.PRODUCTOS.TITLE, icon: 'list' }
]

export const MENU_WALMART = [
	{ path: WALMART.BASE + WALMART.TIPOS_TIENDAS, name: CONTENT.WALMART.TIPOS_TIENDAS.TITLE, icon: 'list' },
	{ path: WALMART.BASE + WALMART.TIENDA, name: CONTENT.WALMART.TIENDA.TITLE, icon: 'list' },
	{ path: WALMART.BASE + WALMART.PRODUCTOS, name: CONTENT.WALMART.PRODUCTOS.TITLE, icon: 'list' }
]

export const BASE_URL = process.env.BASE_URL

export const CODE_HTTP = {
	_200: 200,
	_201: 201,
	_400: 400,
	_404: 404,
	_500: 500
}

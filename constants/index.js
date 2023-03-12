import { CONFIG } from 'config'
import { CONTENT } from 'content'

const { CERO_HUMEDAD, WALMART, START_APP, EXIT_APP } = CONFIG.ROUTER
const { GENERIC } = CONTENT

export const STATUS = [
	{ key: '0', value: GENERIC.STATUS.INACTIVE },
	{ key: '1', value: GENERIC.STATUS.ACTIVE }
]

export const LEFT_OPTIONS = [{ path: START_APP, name: 'Menu' }]
export const RIGHT_OPTIONS = [{ path: EXIT_APP, name: 'Logout' }]

export const MENU_OPTIONS = [
	{ path: CERO_HUMEDAD.BASE, name: CONTENT.CERO_HUMEDAD.TITLE, icon: 'list' },
	{ path: WALMART.BASE, name: CONTENT.WALMART.TITLE, icon: 'list' }
]

export const MENU_CERO_HUMEDAD = [
	{ path: CERO_HUMEDAD.BASE + CERO_HUMEDAD.PRODUCTOS, name: CONTENT.CERO_HUMEDAD.PRODUCTOS.TITLE, icon: 'list' }
]

export const MENU_WALMART = [
	{ path: WALMART.BASE + WALMART.TIPOS_TIENDAS, name: CONTENT.WALMART.TIPOS_TIENDAS.TITLE, icon: 'list' },
	{ path: WALMART.BASE + WALMART.TIENDAS, name: CONTENT.WALMART.TIENDAS.TITLE, icon: 'list' },
	{ path: WALMART.BASE + WALMART.PRODUCTOS, name: CONTENT.WALMART.PRODUCTOS.TITLE, icon: 'list' },
	{ path: WALMART.BASE + WALMART.TABULAR, name: CONTENT.WALMART.TABULAR.TITLE, icon: 'list' },
	{ path: WALMART.BASE + WALMART.LOGS, name: CONTENT.WALMART.LOGS.TITLE, icon: 'list' },
	{ path: WALMART.BASE + WALMART.GRAFICAS, name: CONTENT.WALMART.GRAFICAS.TITLE, icon: 'list' }
]

export const BASE_URL = process.env.BASE_URL

export const CODE_HTTP = {
	_200: 200,
	_201: 201,
	_400: 400,
	_404: 404,
	_500: 500
}

const BASE_URL = process.env.NEXT_PUBLIC_URL

export const CONFIG = {
	ROUTER: {
		START_APP: '/',
		EXIT_APP: '/Salir',
		CREAR: '/crear',
		CERO_HUMEDAD: {
			BASE: '/cero-humedad',
			PRODUCTOS: '/productos'
		},
		WALMART: {
			BASE: '/walmart',
			PRODUCTOS: '/productos',
			TIPOS_TIENDAS: '/tipos-tiendas',
			TIENDA: '/tienda'
		},
		USUARIOS: {
			USER: '/Auth/User',
			LOGIN: '/Auth/Login',
			REGISTER: '/Auth/Register',
			RESET_PASSWORD: '/Auth/Login'
		}
	},
	API: {
		CERO_HUMEDAD: {
			PRODUCTOS: `${BASE_URL}/api/cero-humedad/productos`
		},
		WALMART: {
			PRODUCTOS: `${BASE_URL}/api/walmart/productos`,
			TIPOS_TIENDAS: `${BASE_URL}/api/walmart/tipos-tiendas`,
			TIENDA: `${BASE_URL}/api/walmart/tienda`
		}
	}
}

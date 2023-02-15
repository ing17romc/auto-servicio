import Layout from 'components/Layout'
import ComponentEdit from './components/ComponentEdit'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import Error from 'next/error'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'

const { TITLE_EDIT } = CONTENT.WALMART.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.WALMART
const { PRODUCTOS: API_PRODUCTOS } = CONFIG.API.CERO_HUMEDAD
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.WALMART

const edit = ({ data, error, api, products }) => {
	if (error && error.statusCode) { return <Error statusCode={error.statusCode} title={error.statusText} /> }

	const { id, nombre, estado, idCeroHumedadProducto } = data

	return (
		<Layout>
			<ComponentEdit
				id={id}
				pathRetun={BASE + PATH}
				api={api}
				title={TITLE_EDIT}
				newId= {id}
				nombre= {nombre}
				estado= {estado}
				idCeroHumedadProducto= {idCeroHumedadProducto}
				products={products}
			>
			</ComponentEdit>
		</Layout>
	)
}

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async (props) => {
	try {
		const products = await fetch(API_PRODUCTOS)
		const responseJSON = await products.json()

		const response = await fetch(`${API}/${props.params.id}`)

		if (response.status === 200) {
			const data = await response.json()
			return { props: { data, api: API, products: responseJSON.data } }
		}

		return {
			props: {
				error: {
					statusCode: response.status,
					statusText: 'Invalid Id'
				}
			}
		}
	} catch (error) {
		console.log(error)
		return { props: {} }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(edit)

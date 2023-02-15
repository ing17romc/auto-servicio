import Layout from 'components/Layout'
import ComponentEdit from '../components/ComponentEdit'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'

const { TITLE_NEW } = CONTENT.WALMART.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.WALMART
const { PRODUCTOS: API_PRODUCTOS } = CONFIG.API.CERO_HUMEDAD
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.WALMART

const index = ({ api, products }) => {
	return (
		<Layout>
			<ComponentEdit
				pathRetun={BASE + PATH}
				api={api}
				title={TITLE_NEW}
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
		return { props: { api: API, products: responseJSON.data } }
	} catch (error) {
		console.log(error)
		return { props: {} }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

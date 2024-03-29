import Layout from 'components/Layout'
import ComponentEdit from '../components/ComponentEdit'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'
import { getBreadcrumb } from '../../../../lib/utils'
import { useRouter } from 'next/router'

const { TITLE_NEW } = CONTENT.WALMART.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.WALMART
const { PRODUCTOS: API_PRODUCTOS } = CONFIG.API.CERO_HUMEDAD
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.WALMART

const index = ({ api, products }) => {
	const router = useRouter()

	return (
		<Layout breadcrumbOptions={getBreadcrumb(router)}>
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
		return { props: { api: API, products: responseJSON.result } }
	} catch (error) {
		console.log(error)
		return { props: {} }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

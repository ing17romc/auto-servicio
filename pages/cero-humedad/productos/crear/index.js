import Layout from 'components/Layout'
import GenericEdit from 'components/GenericEdit'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'

const { TITLE_NEW } = CONTENT.CERO_HUMEDAD.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.CERO_HUMEDAD
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.CERO_HUMEDAD

const index = () => {
	return (
		<Layout>
			<GenericEdit pathRetun={BASE + PATH} title={TITLE_NEW} api={API} />
		</Layout>
	)
}

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async (props) => {
	return { props: { } }
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

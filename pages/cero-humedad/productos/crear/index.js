import Layout from 'components/Layout'
import GenericEdit from 'components/GenericEdit'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'
import { getBreadcrumb } from '../../../../lib/utils'
import { useRouter } from 'next/router'

const { TITLE_NEW } = CONTENT.CERO_HUMEDAD.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.CERO_HUMEDAD
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.CERO_HUMEDAD

const index = () => {
	const router = useRouter()

	return (
		<Layout breadcrumbOptions={getBreadcrumb(router)}>
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

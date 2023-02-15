import Layout from 'components/Layout'
import GenericEdit from 'components/GenericEdit'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'

const { TITLE_NEW } = CONTENT.WALMART.TIPOS_TIENDAS
const { TIPOS_TIENDAS: API } = CONFIG.API.WALMART
const { TIPOS_TIENDAS: PATH, BASE } = CONFIG.ROUTER.WALMART

const index = ({ api }) => {
	return (
		<Layout>
			<GenericEdit pathRetun={BASE + PATH} title={TITLE_NEW} api={api} />
		</Layout>
	)
}

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async (props) => {
	return { props: { api: API } } 
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

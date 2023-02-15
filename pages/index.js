
import Layout from 'components/Layout'
import Menu from 'components/Menu'
import { MENU_OPTIONS } from '../constants'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'

const index = () => {
	return <Layout>
		<div className='main-container padding-h-40'>
			<h1>Bienvenido!!!</h1>
		</div>
	</Layout>
}

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})()

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

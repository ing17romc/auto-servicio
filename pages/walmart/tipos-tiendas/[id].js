import Layout from 'components/Layout'
import GenericEdit from 'components/GenericEdit'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import Error from 'next/error'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'
import { getBreadcrumb } from '../../../lib/utils'
import { useRouter } from 'next/router'

const { TITLE_EDIT } = CONTENT.WALMART.TIPOS_TIENDAS
const { TIPOS_TIENDAS: API } = CONFIG.API.WALMART
const { TIPOS_TIENDAS: PATH, BASE } = CONFIG.ROUTER.WALMART

const edit = ({ data, error }) => {
	if (error && error.statusCode) { return <Error statusCode={error.statusCode} title={error.statusText} /> }

	const { id, nombre, estado } = data
	const router = useRouter()

	return (
		<Layout breadcrumbOptions={getBreadcrumb(router)}>
			<GenericEdit
				pathRetun={BASE + PATH}
				api={API}
				title={TITLE_EDIT}
				id={id}
				nombre={nombre}
				estado={estado}
			/>
		</Layout>
	)
}

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async (props) => {
	try {
		const response = await fetch(`${API}/${props.params.id}`)

		if (response.status === 200) {
			const data = await response.json()
			return { props: { data } }
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

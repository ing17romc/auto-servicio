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

const { TITLE_EDIT } = CONTENT.CERO_HUMEDAD.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.CERO_HUMEDAD
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.CERO_HUMEDAD

const edit = ({ data, error }) => {
	if (error && error.statusCode) { return <Error statusCode={error.statusCode} title={error.statusText} /> }

	const { id, nombre, estado } = data

	return (
		<Layout>
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

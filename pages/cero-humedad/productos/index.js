
import Layout from 'components/Layout'
import GenericList from 'components/GenericList'
import { ColumnRemove, ColumnEdit, ColumnStatus } from 'components/Columns'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'

const { TITLE } = CONTENT.CERO_HUMEDAD.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.CERO_HUMEDAD
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.CERO_HUMEDAD

const tableHeaders =								<tr>
	<th style={{ width: '10%' }}>{CONTENT.GENERIC.ID}</th>
	<th style={{ width: '60%' }}>{CONTENT.GENERIC.NAME}</th>
	<th style={{ width: '10%' }}>{CONTENT.GENERIC.ESTADO}</th>
	<th style={{ width: '10%' }}></th>
	<th style={{ width: '10%' }}></th>
</tr>

const getRows = (dt, api) => {
	return dt.map((element, i) => (
		<tr key={i}>
			<td style={{ width: '10%' }}>{element.id}</td>
			<td style={{ width: '60%' }}>{element.nombre}</td>
			<ColumnStatus width='10%' estado={element.estado} path={BASE + PATH}/>
			<ColumnEdit width='10%' id={element.id} path={BASE + PATH}/>
			<ColumnRemove width='10%' id={element.id} api={api} path={BASE + PATH}/>
		</tr>
	))
}

const index = ({ data, api }) => (
	<Layout>
		<GenericList
			title={TITLE}
			path={BASE + PATH}
		>
			{tableHeaders}
			{getRows(data, api)}
		</GenericList>
	</Layout>
)

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async () => {
	try {
		const response = await fetch(API)
		const responseJSON = await response.json()

		return { props: { data: responseJSON.data, api: API } }
	} catch (error) {
		console.log(error)
		return { props: { data: [] } }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

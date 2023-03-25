
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
import { getBreadcrumb } from '../../../lib/utils'
import { useRouter } from 'next/router'

const { TITLE } = CONTENT.WALMART.PRODUCTOS
const { PRODUCTOS: API } = CONFIG.API.WALMART
const { PRODUCTOS: PATH, BASE } = CONFIG.ROUTER.WALMART

const tableHeaders =								<tr>
	<th style={{ width: '10%' }}>{CONTENT.GENERIC.ID}</th>
	<th style={{ width: '30%' }}>{CONTENT.GENERIC.NAME}</th>
	<th style={{ width: '30%' }}>{CONTENT.GENERIC.NAME}</th>
	<th style={{ width: '10%' }}>{CONTENT.GENERIC.STATUS.NAME}</th>
	<th style={{ width: '10%' }}></th>
	<th style={{ width: '10%' }}></th>
</tr>

const getRows = (dt) => {
	return dt.map((element, i) => (
		<tr key={i}>
			<td style={{ width: '10%' }}>{element.id}</td>
			<td style={{ width: '30%' }}>{element.nombre}</td>
			<td style={{ width: '30%' }}>{element.nombre_original}</td>
			<ColumnStatus width='10%' estado={element.estado} path={BASE + PATH}/>
			<ColumnEdit width='10%' id={element.id} path={BASE + PATH}/>
			<ColumnRemove width='10%' id={element.id} api={API} path={BASE + PATH}/>
		</tr>
	))
}

const index = ({ data }) => {
	const router = useRouter()

	return (
		<Layout breadcrumbOptions={getBreadcrumb(router)}>
			<GenericList
				title={TITLE}
				path={BASE + PATH}
				returnPath={BASE}
			>
				{tableHeaders}
				{getRows(data)}
			</GenericList>
		</Layout>
	)
}

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async () => {
	try {
		console.log(API)
		const response = await fetch(API)
		const responseJSON = await response.json()

		return { props: { data: responseJSON.result } }
	} catch (error) {
		console.log(error)
		return { props: { data: [] } }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

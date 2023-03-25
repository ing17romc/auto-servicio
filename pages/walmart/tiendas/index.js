
import Layout from 'components/Layout'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'
import { UI, functions } from 'edt-lib'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { getBreadcrumb } from '../../../lib/utils'

const { TITLE } = CONTENT.WALMART.TIENDAS
const { TIENDAS: API } = CONFIG.API.WALMART

const tableHeaders =								<tr>
	<th style={{ width: '5%' }}>Código</th>
	<th style={{ width: '30%' }}>{CONTENT.GENERIC.NAME}</th>
	<th style={{ width: '20%' }}>Tipo tienda</th>
	<th style={{ width: '5%' }}>CP</th>
	<th style={{ width: '30%' }}>Localidad</th>
	<th style={{ width: '10%' }}>Archivo</th>
</tr>

const getRows = (pages, getIndex) => {
	if (pages.length === 0) return <tr></tr>
	return pages[getIndex].map((element, i) => (
		<tr key={i}>
			<td style={{ width: '5%' }}>{element.id}</td>
			<td style={{ width: '30%' }}>{element.nombre}</td>
			<td style={{ width: '20%' }}>{element.tipoTienda}</td>
			<td style={{ width: '5%' }}>{element.codigoPostal}</td>
			<td style={{ width: '30%' }}>{element.localidad}</td>
			<td style={{ width: '10%' }}>{element.archivo}</td>
		</tr>
	))
}

const index = ({ data }) => {
	const router = useRouter()
	const { Title } = UI
	const { BASE: RETURN_PATH } = CONFIG.ROUTER.WALMART

	const { getValueInput } = functions
	const [state, setstate] = useState({
		page: 1,
		pages: 300
	})

	const getSlides = (acc, cur, slidesPerView) => {
		if (!Array.isArray(acc) || !Array.isArray(cur) || !slidesPerView) { return [] }

		if (cur.length) {
			acc.push(cur.slice(0, slidesPerView))
			getSlides(acc, cur.slice(slidesPerView, cur.length), slidesPerView)
		}
		return acc
	}

	const pages = getSlides([], data, state.pages)

	const getIndex = pages.length < state.page ? 0 : state.page - 1

	const onInputChange = e => {
		const object = getValueInput(e)
		if (e) {
			setstate({
				...state,
				[object.key]: object.value,
				page: 1
			})
		}
	}
	return (
		<Layout breadcrumbOptions={getBreadcrumb(router)}>
			<div className="container-body">
				<div className="grid-primary ">
					<div className="start-1 size-12 padding-v-20">
						<Title label={TITLE} />
					</div>

					<div className="start-1  padding-v-30" />
					<div className="grid-secondary bg-light-gray elevated">
						<div className="start-1 size-10 padding-v-30">
							<h3> Listado... </h3>
						</div>

						<div className="start-24 size-1 padding-v-20">
							<UI.ImageButton
								id="keyboard_return"
								icon="keyboard_return"
								text="retornar"
								size="sm"
								onClick={() => router.push(RETURN_PATH)}
							/>
						</div>

						<div className="start-20 size-5 padding-v-20">
							<UI.Selector
								id='pages'
								value={state.pages.toString()}
								options={[
									{ key: '100', value: '100' },
									{ key: '200', value: '200' },
									{ key: '300', value: '300' }
								]}
								eventChange={e => onInputChange(e)}
								titleTop='Number item by page'
							/>
						</div>

						<div className='start-1 size-24 padding-v-20 center'>
							<UI.Pagination
								totalCount= {pages.length}
								currentPage= {state.page}
								onPageChange= {currentPage => setstate({ ...state, page: currentPage })}
							/>
						</div>

						<div className="start-1 size-24 padding-v-20 ">
							<div className='bg-white padding-h-30 padding-v-30'>
								<table className="big-table">
									<tbody>
										{tableHeaders}
										{getRows(pages, getIndex)}
									</tbody>
								</table>
							</div>
							<div className="padding-v-20"></div>
						</div>

						<div className='start-1 size-24 padding-v-20 center'>
							<UI.Pagination
								totalCount= {pages.length}
								currentPage= {state.page}
								onPageChange= {currentPage => setstate({ ...state, page: currentPage })}
							/>
						</div>
					</div>

					<div className="start-1 padding-v-20" />
				</div>
			</div>
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

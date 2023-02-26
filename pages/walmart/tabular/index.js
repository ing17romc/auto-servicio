
import Layout from 'components/Layout'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'
import { UI, functions } from 'edt-lib'
import React, { useState } from 'react'

const { TITLE } = CONTENT.WALMART.TABULAR
const { TABULAR: API } = CONFIG.API.WALMART

const tableHeaders =								<tr>
	<th style={{ width: '10%' }}>codigoProducto</th>
	<th style={{ width: '10%' }}>codigoTienda</th>
	<th style={{ width: '10%' }}>precioVentaUnidad</th>
	<th style={{ width: '10%' }}>costoUnidad</th>
	<th style={{ width: '10%' }}>cantidadVendida</th>

	<th style={{ width: '10%' }}>totalPrecio</th>
	<th style={{ width: '10%' }}>inventario</th>

</tr>

const getRows = (pages, getIndex) => {
	if (pages.length === 0) return <tr></tr>
	return pages[getIndex].map((element, i) => (
		<tr key={i}>
			<td style={{ width: '10%' }}>{element.codigoProducto}</td>
			<td style={{ width: '10%' }}>{element.codigoTienda}</td>
			<td style={{ width: '10%' }}>{element.precioVentaUnidad}</td>
			<td style={{ width: '10%' }}>{element.costoUnidad}</td>
			<td style={{ width: '10%' }}>{element.cantidadVendida}</td>

			<td style={{ width: '10%' }}>{element.totalPrecio}</td>
			<td style={{ width: '10%' }}>{element.inventario}</td>

		</tr>
	))
}

const index = ({ data, options, anioSemana }) => {
	const { Title } = UI

	const { getValueInput } = functions
	const [state, setstate] = useState({
		page: 1,
		pages: 400,
		anioSemana,
		dt: data
	})
	const [loading, setLoading] = React.useState(false)

	const getSlides = (acc, cur, slidesPerView) => {
		if (!Array.isArray(acc) || !Array.isArray(cur) || !slidesPerView) { return [] }

		if (cur.length) {
			acc.push(cur.slice(0, slidesPerView))
			getSlides(acc, cur.slice(slidesPerView, cur.length), slidesPerView)
		}
		return acc
	}

	const pages = getSlides([], state.dt, state.pages)

	const getIndex = pages.length < state.page ? 0 : state.page - 1

	const onInputChange = async e => {
		const object = getValueInput(e)

		console.log(object)

		if (object.key === 'anioSemana') {
			setLoading(true)
			const values = object.value.split('-')
			const response = await fetch(API, {
				headers: {
					'Content-Type': 'application/json',
					anio: values[0],
					semana: values[1]
				}
			})
			const responseJSON = await response.json()

			if (e) {
				setstate({
					...state,
					[object.key]: object.value,
					page: 1,
					dt: responseJSON.data
				})
			}
			setLoading(false)
		} else {
			if (e) {
				setstate({
					...state,
					[object.key]: object.value,
					page: 1
				})
			}
		}
	}

	return (
		<Layout>
			<UI.Spinner show={loading}/>
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

						<div className="start-1 size-3 padding-v-20">
							<UI.Selector
								id='anioSemana'
								value={state.anioSemana}
								options={options}
								eventChange={e => onInputChange(e)}
								titleTop='Año - Semana'
							/>
						</div>

						<div className="start-20 size-5 padding-v-20">
							<UI.Selector
								id='pages'
								value={state.pages.toString()}
								options={[
									{ key: '100', value: '100' },
									{ key: '200', value: '200' },
									{ key: '300', value: '300' },
									{ key: '400', value: '400' },
									{ key: '500', value: '500' }
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
								<table>
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
		const anioSemana = await fetch(`${API}/anio-semana`)
		const anioSemanaJSON = await anioSemana.json()

		const options = []

		for (const iterator of anioSemanaJSON.data) {
			options.push({ key: `${iterator.anio}-${iterator.semana}`, value: `${iterator.anio}-${iterator.semana}` })
		}

		const anio = anioSemanaJSON.data[0].anio
		const semana = anioSemanaJSON.data[0].semana

		console.log(API)
		const response = await fetch(API, {
			headers: {
				'Content-Type': 'application/json',
				anio,
				semana
			}
		})
		const responseJSON = await response.json()

		return { props: { data: responseJSON.data, options, anioSemana: `${anio}-${semana}` } }
	} catch (error) {
		console.log(error)
		return { props: { data: [], anioSemanaJSON: [] } }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)
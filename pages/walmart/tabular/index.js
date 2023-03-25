
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
import { numberFormat, getBreadcrumb } from '../../../lib/utils'
import Totales from '../components/Totales'

const { TITLE } = CONTENT.WALMART.TABULAR
const { TABULAR: API_TABULAR, PRODUCTOS: API_PRODUCTOS, TIPOS_TIENDAS: API_TIPOS_TIENDAS } = CONFIG.API.WALMART

const tableHeaders = <tr>
	<th style={{ width: '20%' }}>Producto</th>
	<th style={{ width: '10%' }}>Nombre</th>
	<th style={{ width: '20%' }}>Tienda</th>
	<th style={{ width: '10%' }}>Tipo de tienda</th>
	<th style={{ width: '5%', textAlign: 'right' }}>Precio</th>
	<th style={{ width: '5%', textAlign: 'right' }}>Costo</th>
	<th style={{ width: '5%', textAlign: 'right' }}>VU</th>

	<th style={{ width: '10%', textAlign: 'right' }}>VP</th>
	<th style={{ width: '5%', textAlign: 'right' }}>Inv.</th>
	<th style={{ width: '10%' }}>Archivo</th>

</tr>

const getRows = (pages, getIndex) => {
	if (pages.length === 0) return <tr></tr>
	return pages[getIndex].map((element, i) => (
		<tr key={i}>
			<td style={{ width: '20%' }}>{`${element.codigoProducto} - ${element.wp_nombre}`}</td>
			<td style={{ width: '10%' }}>{element.chp_nombre}</td>
			<td style={{ width: '20%' }}>{`${element.codigoTienda} ${element.wt_nombre}`}</td>
			<td style={{ width: '10%' }}>{element.wtt_nombre}</td>
			<td style={{ width: '5%', textAlign: 'right' }}>$ {numberFormat(element.precioVentaUnidad)}</td>
			<td style={{ width: '5%', textAlign: 'right' }}>$ {numberFormat(element.costoUnidad)}</td>
			<td style={{ width: '5%', textAlign: 'right' }}>{numberFormat(element.cantidadVendida)}</td>

			<td style={{ width: '10%', textAlign: 'right' }}>$ {numberFormat(element.totalPrecio)}</td>
			<td style={{ width: '5%', textAlign: 'right' }}>{numberFormat(element.inventario)}</td>

			<td style={{ width: '10%' }}>{element.archivo}</td>

		</tr>
	))
}

const index = ({ data, options, anioSemana, optionsProducts, optionsTypeStore }) => {
	const router = useRouter()
	const { Title } = UI
	const { BASE: RETURN_PATH } = CONFIG.ROUTER.WALMART

	const { getValueInput } = functions
	const [state, setstate] = useState({
		page: 1,
		pages: 500,
		anioSemana,
		idTipoTienda: 0,
		idProducto: 0,
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

	const pages = getSlides([], state.dt.resultados, state.pages)

	const getIndex = pages.length < state.page ? 0 : state.page - 1

	const onInputChange = async e => {
		const object = getValueInput(e)

		if (object.key === 'anioSemana' || object.key === 'idProducto' || object.key === 'idTipoTienda') {
			setLoading(true)
			const values = (object.key === 'anioSemana') ? object.value.split('-') : state.anioSemana.split('-')
			const idProducto = (object.key === 'idProducto') ? object.value : state.idProducto
			const idTipoTienda = (object.key === 'idTipoTienda') ? object.value : state.idTipoTienda

			const response = await fetch(API_TABULAR, {
				headers: {
					'Content-Type': 'application/json',
					anio: values[0],
					semana: values[1],
					idProducto,
					idTipoTienda
				}
			})
			const responseJSON = await response.json()

			if (e) {
				setstate({
					...state,
					[object.key]: object.value,
					page: 1,
					dt: responseJSON.result
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

	const ventaUnidades = state.dt.resultados && state.dt.resultados.length > 0
		? (state.dt.resultados.reduce((sum, value) => (typeof value.cantidadVendida === 'number' ? sum + value.cantidadVendida : sum), 0))
		: 0

	const ventaPesos = state.dt.resultados && state.dt.resultados.length > 0
		? (state.dt.resultados.reduce((sum, value) => (typeof value.totalPrecio === 'number' ? sum + value.totalPrecio : sum), 0))
		: 0

	const inventario = state.dt.resultados && state.dt.resultados.length > 0
		? (state.dt.resultados.reduce((sum, value) => (typeof value.inventario === 'number' ? sum + value.inventario : sum), 0))
		: 0

	return (
		<Layout breadcrumbOptions={getBreadcrumb(router)}>
			<UI.Spinner show={loading}/>
			<div className="container-body">
				<div className="grid-primary ">
					<div className="start-1 size-12 padding-v-20">
						<Title label={TITLE} />
					</div>

					<div className="start-1  padding-v-30" />
					<div className="grid-secondary bg-light-gray elevated">
						<div className="start-1 size-8 padding-v-30">
							<h3> Filtros... </h3>
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

						<div className="start-1 size-4 padding-v-20">
							<UI.Selector
								id='anioSemana'
								value={state.anioSemana}
								options={options}
								eventChange={e => onInputChange(e)}
								titleTop='Año - Semana'
							/>
						</div>

						<div className=" size-8 padding-v-20">
							<UI.Selector
								id='idProducto'
								value={state.idProducto}
								options={optionsProducts}
								eventChange={e => onInputChange(e)}
								titleTop='Producto'
							/>
						</div>
						<div className=" size-8 padding-v-20">
							<UI.Selector
								id='idTipoTienda'
								value={state.idTipoTienda}
								options={optionsTypeStore}
								eventChange={e => onInputChange(e)}
								titleTop='Tipo de tienda'
							/>
						</div>

						<div className="size-4 padding-v-20">
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
								titleTop='Registros por pagina'
							/>
						</div>

						<Totales ventaUnidades={ventaUnidades} ventaPesos={ventaPesos} inventario={inventario} isVertical={false} />

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
		console.log(API_TABULAR)
		const anioSemana = await fetch(`${API_TABULAR}/anio-semana`)
		const anioSemanaJSON = await anioSemana.json()

		console.log(API_PRODUCTOS)
		const productos = await fetch(`${API_PRODUCTOS}`)
		const productosJSON = await productos.json()

		console.log(API_TIPOS_TIENDAS)
		const tipoTiendas = await fetch(`${API_TIPOS_TIENDAS}`)
		const tipoTiendasJSON = await tipoTiendas.json()

		const options = []
		const optionsProducts = [{ key: '0', value: 'Selecionar' }]
		const optionsTypeStore = [{ key: '0', value: 'Selecionar' }]

		for (const iterator of productosJSON.result) {
			optionsProducts.push({ key: `${iterator.id}`, value: `${iterator.id} - ${iterator.nombre} - ${iterator.nombre_original}` })
		}

		for (const iterator of tipoTiendasJSON.result) {
			optionsTypeStore.push({ key: `${iterator.id}`, value: `${iterator.nombre}` })
		}

		for (const iterator of anioSemanaJSON.result) {
			options.push({ key: `${iterator.anio}-${iterator.semana}`, value: `${iterator.anio}-${iterator.semana}` })
		}

		const anio = anioSemanaJSON.result[0].anio
		const semana = anioSemanaJSON.result[0].semana

		console.log(API_TABULAR)
		const response = await fetch(API_TABULAR, {
			headers: {
				'Content-Type': 'application/json',
				anio,
				semana,
				idTipoTienda: 0,
				idProducto: 0
			}
		})
		const responseJSON = await response.json()

		return { props: { data: responseJSON.result, options, anioSemana: `${anio}-${semana}`, optionsProducts, optionsTypeStore } }
	} catch (error) {
		console.log(error)
		return { props: { data: [], anioSemanaJSON: [], optionsProducts: [], optionsTypeStore: [] } }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

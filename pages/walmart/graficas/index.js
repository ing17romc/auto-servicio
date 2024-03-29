
import Layout from 'components/Layout'
import { CONFIG } from 'config'
import { CONTENT } from 'content'
import Graficas from './graficas.js'
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

const { GRAFICAS: API } = CONFIG.API.WALMART
const { GENERIC } = CONTENT

const tableHeaders = <tr>
	<th style={{ width: '10%', textAlign: 'right' }}>{'Año'}</th>
	<th style={{ width: '10%', textAlign: 'right' }}>{'Semana'}</th>
	<th style={{ width: '20%', textAlign: 'right' }}>{'Venta unidades'}</th>
	<th style={{ width: '30%', textAlign: 'right' }}>{'Venta peso'}</th>
	<th style={{ width: '20%', textAlign: 'right' }}>{'Inventario'}</th>
</tr>

const getRows = (dt) => {
	return dt.map((element, i) => (
		<tr key={i}>
			<td style={{ width: '10%', textAlign: 'right' }}>{element.anio}</td>
			<td style={{ width: '10%', textAlign: 'right' }}>{element.semana}</td>
			<td style={{ width: '20%', textAlign: 'right' }}>{numberFormat(element.totalVentaCantidad)}</td>
			<td style={{ width: '30%', textAlign: 'right' }}>$ {numberFormat(element.totalVentaPrecio)}</td>
			<td style={{ width: '20%', textAlign: 'right' }}>{numberFormat(element.totalInventario)}</td>
		</tr>
	))
}

const getData = (data, anio) => {
	const arr = []

	data.forEach(function (a) {
		if (a.anio === anio) {
			arr.push(a)
		}
	})
	return arr.sort((a, b) => {
		return a.semana - b.semana
	})
}

const getFirtsData = (data) => {
	const arr = []

	data.forEach(function (a) {
		if (!arr.some(value => value.key === a.anio.toString())) {
			arr.push(a.anio.toString())
		}
	})
	return arr.sort((a, b) => {
		return a.value - b.value
	})[0]
}

const index = ({ data = [] }) => {
	const { getValueInput } = functions
	const router = useRouter()
	const { BASE: RETURN_PATH } = CONFIG.ROUTER.WALMART

	const getAnios = (data) => {
		const arr = []
		console.log(data)
		if (data) {
			data.forEach(function (a) {
				if (!arr.some(value => value.key === a.anio.toString())) {
					arr.push({ key: a.anio.toString(), value: a.anio.toString() })
				}
			})
		}
		return arr.sort((a, b) => {
			return a.value - b.value
		})
	}
	console.log(data)
	const [state, setstate] = useState({
		anio: Number(getFirtsData(data))
	})

	const newData = getData(data, state.anio)

	const onInputChange = async e => {
		const object = getValueInput(e)

		if (e) {
			setstate({
				...state,
				[object.key]: Number(object.value)
			})
		}
	}

	const ventaUnidades = newData && newData.length > 0
		? (newData.reduce((sum, value) => (typeof value.totalVentaCantidad === 'string' ? sum + Number(value.totalVentaCantidad) : sum), 0))
		: 0

	const ventaPesos = newData && newData.length > 0
		? (newData.reduce((sum, value) => (typeof value.totalVentaPrecio === 'number' ? sum + value.totalVentaPrecio : sum), 0))
		: 0

	const inventario = newData && newData.length > 0
		? (newData.reduce((sum, value) => (typeof value.totalInventario === 'string' ? sum + Number(value.totalInventario) : sum), 0))
		: 0

	return (
		<Layout breadcrumbOptions={getBreadcrumb(router)}>
			<div className="container-body">
				<div className="grid-primary ">
					<div className="grid-secondary">
						<div className="start-1 size-23 padding-v-20">
							<UI.Title label='Graficas' />
						</div>

						<div className="size-1 padding-v-20">
							<UI.ImageButton
								id="clear"
								icon="clear"
								text="cerrar"
								size="sm"
								onClick={() => router.push(RETURN_PATH)}
							/>
						</div>
					</div>

					<div className="start-1  padding-v-30" />
					<div className="grid-secondary bg-light-gray elevated">

						<div className="start-1 size-10 padding-v-20">
							<h3> {GENERIC.FILTROS} </h3>
						</div>

						<div className="start-1 size-12 padding-v-20">

							<UI.Selector
								id='anio'
								value={state.anio}
								options={getAnios(data)}
								eventChange={e => onInputChange(e)}
								titleTop='Año'
							/>
						</div>

						<div className="start-1 size-12 padding-v-60 padding-h-60 center bg-white">
							<Graficas chartsTitle={'Venta en pesos'} dataSetTitle={state.anio} data={newData.map(x => x.totalVentaPrecio)} labels={newData.map(x => x.semana)}/>
						</div>
						<div className=" size-12  padding-v-60 padding-h-60 center bg-white">
							<Graficas chartsTitle={'Venta en unidades'} dataSetTitle={state.anio} data={newData.map(x => x.totalVentaCantidad)} labels={newData.map(x => x.semana)}/>
						</div>
						<div className="start-1 size-24  padding-v-20" />
						<div className="start-1 size-12  padding-v-60 padding-h-60 center bg-white">
							<Graficas chartsTitle={'Inventario'} dataSetTitle={state.anio} data={newData.map(x => x.totalInventario)} labels={newData.map(x => x.semana)}/>
						</div>
						<div className=" size-12  padding-v-60 padding-h-60 center bg-white">
							<div className="grid-secondary">
								<Totales ventaUnidades={ventaUnidades} ventaPesos={ventaPesos} inventario={inventario} isVertical={true} />
							</div>
						</div>

						<div className="start-1 size-24  padding-v-20" />

						<div className="start-1 size-24 padding-v-20 ">
							<div className='bg-white padding-h-90 padding-v-30'>
								<table>
									<tbody>
										{tableHeaders}
										{getRows(newData)}
									</tbody>
								</table>
							</div>
						</div>

						<div className="padding-v-20"></div>
					</div>
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


import Layout from 'components/Layout'
import { CONFIG } from 'config'
import { Graficas } from './graficas.js'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'
import { UI, functions } from 'edt-lib'
import React, { useState } from 'react'

const { GRAFICAS: API } = CONFIG.API.WALMART

const tableHeaders = <tr>
	<th style={{ width: '20%' }}>{'Año'}</th>
	<th style={{ width: '20%' }}>{'Semana'}</th>
	<th style={{ width: '20%', textAlign: 'right' }}>{'Venta unidades'}</th>
	<th style={{ width: '20%', textAlign: 'right' }}>{'Venta peso'}</th>
	<th style={{ width: '20%', textAlign: 'right' }}>{'Inventario'}</th>
</tr>

const numberFormat = (number) => {
	return new Intl.NumberFormat('es-MX').format(number)
}

const getRows = (dt) => {
	return dt.map((element, i) => (
		<tr key={i}>
			<td style={{ width: '20%' }}>{element.anio}</td>
			<td style={{ width: '20%' }}>{element.semana}</td>
			<td style={{ width: '20%', textAlign: 'right' }}>{numberFormat(element.totalVentaCantidad)}</td>
			<td style={{ width: '20%', textAlign: 'right' }}>$ {numberFormat(element.totalVentaPrecio)}</td>
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

	console.log(newData)

	return (
		<Layout>
			<div className="grid-primary ">

				<div className="start-1 size-6 padding-v-20">
					<UI.Selector
						id='anio'
						value={state.anio}
						options={getAnios(data)}
						eventChange={e => onInputChange(e)}
						titleTop='Año'
					/>
				</div>

				<div className="start-1 size-12 padding-v-20 center">
					<Graficas chartsTitle={'Venta en unidades'} dataSetTitle={state.anio} data={newData.map(x => x.totalVentaCantidad)} labels={newData.map(x => x.semana)}/>
				</div>

				<div className="start-1 size-12 padding-v-20 center">
					<Graficas chartsTitle={'Venta en pesos'} dataSetTitle={state.anio} data={newData.map(x => x.totalVentaPrecio)} labels={newData.map(x => x.semana)}/>
				</div>

				<div className="start-1 size-12 padding-v-20 center">
					<Graficas chartsTitle={'Inventario'} dataSetTitle={state.anio} data={newData.map(x => x.totalInventario)} labels={newData.map(x => x.semana)}/>
				</div>

				<div className="start-7  size-2 padding-v-20">
					<h5>Venta unidades</h5>
					<h4 className=" padding-v-20">{
						newData && newData.length > 0
							? numberFormat(newData.reduce((sum, value) => (typeof value.totalVentaCantidad === 'string' ? sum + Number(value.totalVentaCantidad) : sum), 0))
							: 0
					}</h4>
				</div>
				<div className=" size-2 padding-v-20">
					<h5>Venta pesos</h5>
					<h4 className=" padding-v-20">$ {
						newData && newData.length > 0
							? numberFormat(newData.reduce((sum, value) => (typeof value.totalVentaPrecio === 'number' ? sum + value.totalVentaPrecio : sum), 0))
							: 0
					}</h4>
				</div>
				<div className=" size-2 padding-v-20">
					<h5>Inventario</h5>
					<h4 className=" padding-v-20">{
						newData && newData.length > 0
							? numberFormat(newData.reduce((sum, value) => (typeof value.totalInventario === 'string' ? sum + Number(value.totalInventario) : sum), 0))
							: 0
					}</h4>
				</div>

				<div className="start-1 size-12 padding-v-20 ">
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

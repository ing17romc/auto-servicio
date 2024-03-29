import React from 'react'
import { numberFormat } from '../../../lib/utils'

const Totales = ({ ventaUnidades, ventaPesos, inventario, isVertical }) => {
	if (isVertical) {
		return <>
			<div className="start-1  size-4 padding-v-20">
				<div className="padding-v-20">
					<h5 className="center">Venta unidades</h5>
					<h4 className=" center padding-v-20">{
						numberFormat(ventaUnidades)
					}</h4>
				</div>
				<div className="padding-v-20">
					<h5 className="center">Venta pesos</h5>
					<h4 className=" center padding-v-20">$ {
						numberFormat(ventaPesos)
					}</h4>
				</div>
				<div className="padding-v-20">
					<h5 className="center">Inventario</h5>
					<h4 className=" center padding-v-20">{
						numberFormat(inventario)
					}</h4>
				</div>
			</div>
		</>
	} else {
		return <>
			<div className="start-13 size-4 padding-v-20">
				<h5 className="center">Venta unidades</h5>
				<h4 className=" center padding-v-20">{
					numberFormat(ventaUnidades)
				}</h4>
			</div>
			<div className=" size-4 padding-v-20">
				<h5 className="center">Venta pesos</h5>
				<h4 className=" center padding-v-20">$ {
					numberFormat(ventaPesos)
				}</h4>
			</div>
			<div className=" size-4 padding-v-20">
				<h5 className="center">Inventario</h5>
				<h4 className=" center padding-v-20">{
					numberFormat(inventario)
				}</h4>
			</div>
		</>
	}
}

export default Totales

import {
	// excuteSP,
	excuteQuery
} from '../../db'

// const SP_CONSULT_ALL = 'SELECT * FROM Walmart_Tabular WHERE anio = ? and semana = ? ;'

const SP_CONSULT_ALL = `SELECT wtb.*, wp.nombre wp_nombre, wt.nombre wt_nombre, wtt.nombre wtt_nombre, chp.nombre chp_nombre
FROM autoservicios.Walmart_Tabular wtb
LEFT JOIN  autoservicios.Walmart_Productos wp
ON wtb.codigoProducto = wp.id
LEFT JOIN  autoservicios.CeroHumedad_Productos chp
ON wp.idCeroHumedadProducto = chp.id
LEFT JOIN  autoservicios.Walmart_Tiendas wt
ON wtb.codigoTienda = wt.id
LEFT JOIN  autoservicios.Walmart_TiposTiendas wtt
ON wt.idTipo = wtt.id WHERE anio = ? and semana = ? and (? = 0 or ? = wtb.codigoProducto) and (? = 0 or ? = wt.idTipo) ;`

// const SP_TOTALES_ANIO_SEMANA = 'SELECT sum(cantidadVendida) totalVentaCantidad, ROUND(sum(totalPrecio), 2) totalVentaPrecio, sum(inventario) totalInventario FROM autoservicios.Walmart_Tabular WHERE anio = ? and semana = ? ;'

const SP_TOTALES_ANIO_SEMANA = `SELECT 
anio, 
semana,
sum(cantidadVendida) totalVentaCantidad, 
ROUND(sum(totalPrecio), 2) totalVentaPrecio, 
sum(inventario) totalInventario
FROM autoservicios.Walmart_Tabular 
GROUP BY anio, semana
ORDER BY anio DESC, semana DESC;`

const SP_ANIO_SEMANA = 'SELECT distinct anio, semana FROM autoservicios.Walmart_Tabular ORDER BY anio DESC, semana DESC;'

export const getAnioSemana = async () => {
	try {
		// const data = await excuteSP(SP);
		const data = await excuteQuery({ query: SP_ANIO_SEMANA })
		// console.log(data)
		return data
	} catch (error) {
		console.log(error)
		return []
	}
}

export const getTotalesAnioSemana = async () => {
	try {
		// const data = await excuteSP(SP);
		const data = await excuteQuery({ query: SP_TOTALES_ANIO_SEMANA })
		// console.log(data)
		return data
	} catch (error) {
		console.log(error)
		return []
	}
}

export const find = async ({ anio, semana, idtipotienda, idproducto }) => {
	console.log({ anio, semana, idtipotienda, idproducto })

	const params = []
	params.push(anio)
	params.push(semana)
	params.push(idproducto)
	params.push(idproducto)
	params.push(idtipotienda)
	params.push(idtipotienda)
	try {
		/*
		const totales = await excuteQuery({
			query: SP_TOTALES,
			params
		})
*/
		const resultados = await excuteQuery({
			query: SP_CONSULT_ALL,
			params
		})
		// return { totales, resultados }
		return { resultados }
	} catch (error) {
		console.log(error)
		return false
	}
}

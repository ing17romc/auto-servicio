import {
	// excuteSP,
	excuteQuery
} from '../../db'

const SP_CONSULT_ALL = 'SELECT * FROM Walmart_Tabular WHERE anio = ? and semana = ? ;'

const SP_TOTALES = 'SELECT sum(cantidadVendida) totalVentaCantidad, ROUND(sum(totalPrecio), 2) totalVentaPrecio, sum(inventario) totalInventario FROM autoservicios.Walmart_Tabular WHERE anio = ? and semana = ? ;'

const SP_ANIO_SEMANA = 'SELECT distinct anio, semana FROM autoservicios.Walmart_Tabular ORDER BY anio DESC, semana DESC;'

export const getAnioSemana = async () => {
	try {
		// const data = await excuteSP(SP);
		const data = await excuteQuery({ query: SP_ANIO_SEMANA })
		console.log(data)
		return data
	} catch (error) {
		console.log(error)
		return []
	}
}

export const find = async ({ anio, semana }) => {
	const params = []
	params.push(anio)
	params.push(semana)
	try {
		const totales = await excuteQuery({
			query: SP_TOTALES,
			params
		})
		const resultados = await excuteQuery({
			query: SP_CONSULT_ALL,
			params
		})
		return { totales, resultados }
	} catch (error) {
		console.log(error)
		return false
	}
}

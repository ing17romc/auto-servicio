import {
	find as _find
} from '../Generic'

const getEntities = (list) => {
	const data = []
	list.forEach((row) =>
		data.push({
			id: row.id,
			nombre: row.nombre,
			codigoPostal: row.codigoPostal,
			tipoTienda: row.tipoTienda,
			localidad: row.localidad
		})
	)
	return data
}

const SP_CONSULT_ALL = 'SELECT Walmart_Tiendas.*, Walmart_TiposTiendas.nombre tipoTienda FROM Walmart_Tiendas LEFT JOIN Walmart_TiposTiendas ON Walmart_Tiendas.idTipo = Walmart_TiposTiendas.id'

export const find = async () => await _find(SP_CONSULT_ALL, getEntities)

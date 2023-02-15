import {
	find as _find,
	save as _save,
	findById as _findById,
	update as _update,
	deleteById as _deleteById
} from '../Generic'

const getEntities = (list) => {
	const data = []
	list.forEach((row) =>
		data.push({
			id: row.id,
			nombre: row.nombre,
			estado: row.estado,
			idCeroHumedadProducto: row.idCeroHumedadProducto,
			nombre_original: row.nombre_original
		})
	)
	return data
}

const getEntity = (data) => {
	if (data.length) {
		return {
			id: data[0].id,
			nombre: data[0].nombre,
			estado: data[0].estado,
			idCeroHumedadProducto: data[0].idCeroHumedadProducto
		}
	} else {
		return null
	}
}

const SP_FIND_ONE = 'SELECT * FROM WalmartProductos WHERE id = ?;'
// const SP_CONSULT_ALL = 'CALL sp_ObtenerCarreras();';
const SP_CONSULT_ALL = 'SELECT WalmartProductos.*, CeroHumedadProductos.nombre nombre_original FROM WalmartProductos LEFT JOIN CeroHumedadProductos ON WalmartProductos.idCeroHumedadProducto = CeroHumedadProductos.id'
const SP_DELETE = 'DELETE FROM WalmartProductos WHERE id = ?;'
const SP_INSERT = 'INSERT INTO WalmartProductos (id, nombre, estado, idCeroHumedadProducto) VALUES (?,?,?,?);'
const SP_UPDATE = 'UPDATE WalmartProductos SET id = ?, nombre = ?, estado = ?, idCeroHumedadProducto = ? WHERE id = ?;'

export const find = async () => await _find(SP_CONSULT_ALL, getEntities)

export const save = async ({ newId, nombre, estado, idCeroHumedadProducto }) => {
	const params = []
	params.push(newId)
	params.push(nombre)
	params.push(estado)
	params.push(idCeroHumedadProducto)
	return await _save(params, SP_INSERT)
}

export const findById = async (id) => await _findById(id, SP_FIND_ONE, getEntity)

export const update = async ({ newId, nombre, estado, idCeroHumedadProducto, id }) => {
	const params = []
	params.push(newId)
	params.push(nombre)
	params.push(estado)
	params.push(idCeroHumedadProducto)
	params.push(id)

	return await _update(params, SP_UPDATE)
}

export const deleteById = async (id) => await _deleteById(id, SP_DELETE)

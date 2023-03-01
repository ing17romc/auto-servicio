import {
	find as _find,
	save as _save,
	findById as _findById,
	update as _update,
	deleteById as _deleteById
} from '../Generic'

const SP_FIND_ONE = 'SELECT * FROM Walmart_Productos WHERE id = ?;'
// const SP_CONSULT_ALL = 'CALL sp_ObtenerCarreras();';
const SP_CONSULT_ALL = 'SELECT Walmart_Productos.*, CeroHumedad_Productos.nombre nombre_original FROM Walmart_Productos LEFT JOIN CeroHumedad_Productos ON Walmart_Productos.idCeroHumedadProducto = CeroHumedad_Productos.id'
const SP_DELETE = 'DELETE FROM Walmart_Productos WHERE id = ?;'
const SP_INSERT = 'INSERT INTO Walmart_Productos (id, nombre, estado, idCeroHumedadProducto) VALUES (?,?,?,?);'
const SP_UPDATE = 'UPDATE Walmart_Productos SET id = ?, nombre = ?, estado = ?, idCeroHumedadProducto = ? WHERE id = ?;'

export const find = async () => await _find(SP_CONSULT_ALL)

export const save = async ({ newId, nombre, estado, idCeroHumedadProducto }) => {
	const params = []
	params.push(newId)
	params.push(nombre)
	params.push(estado)
	params.push(idCeroHumedadProducto)
	return await _save(params, SP_INSERT)
}

export const findById = async (id) => await _findById(id, SP_FIND_ONE)

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

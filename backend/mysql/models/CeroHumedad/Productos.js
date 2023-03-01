import {
	find as _find,
	save as _save,
	findById as _findById,
	update as _update,
	deleteById as _deleteById
} from '../Generic'

const SP_FIND_ONE = 'SELECT * FROM CeroHumedad_Productos WHERE id = ?;'
// const SP_CONSULT_ALL = 'CALL sp_ObtenerCarreras();';
const SP_CONSULT_ALL = 'SELECT * FROM CeroHumedad_Productos;'
const SP_DELETE = 'DELETE FROM CeroHumedad_Productos WHERE id = ?;'
const SP_INSERT = 'INSERT INTO CeroHumedad_Productos (nombre, estado) VALUES (?,?);'
const SP_UPDATE = 'UPDATE CeroHumedad_Productos SET nombre = ?, estado = ? WHERE id = ?;'

export const find = async () => await _find(SP_CONSULT_ALL)

export const save = async ({ nombre, estado }) => {
	const params = []
	params.push(nombre)
	params.push(estado)

	return await _save(params, SP_INSERT)
}

export const findById = async (id) => await _findById(id, SP_FIND_ONE)

export const update = async ({ id, nombre, estado }) => {
	const params = []
	params.push(nombre)
	params.push(estado)
	params.push(id)

	return await _update(params, SP_UPDATE)
}

export const deleteById = async (id) => await _deleteById(id, SP_DELETE)

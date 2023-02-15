import { CODE_HTTP } from 'constants/index'
import { findById, deleteById, update } from '../../../../backend/mysql/models/Walmart/Productos'
import { get_id_generic, put_generic, delete_generic } from 'lib/apiGeneric'

const index = async (req, res) => {
	const {
		method,
		body: { newId, nombre, estado, idCeroHumedadProducto },
		query: { id }
	} = req

	switch (method) {
	case 'GET':
		return get_id_generic(res, id, findById)
	case 'PUT':
		return put_generic(res, { newId, nombre, estado, idCeroHumedadProducto, id }, update)
	case 'DELETE':
		return delete_generic(res, id, deleteById)

	default:
		return res
			.status(CODE_HTTP._400)
			.json({ msg: 'This method is not supported' })
	}
}

export default index

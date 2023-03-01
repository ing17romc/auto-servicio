import {
	find as _find
} from '../Generic'

const SP_CONSULT_ALL = 'SELECT Walmart_Tiendas.*, Walmart_TiposTiendas.nombre tipoTienda FROM Walmart_Tiendas LEFT JOIN Walmart_TiposTiendas ON Walmart_Tiendas.idTipo = Walmart_TiposTiendas.id'

export const find = async () => await _find(SP_CONSULT_ALL)

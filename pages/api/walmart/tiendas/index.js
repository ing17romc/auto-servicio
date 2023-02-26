import { CODE_HTTP } from 'constants/index'
import { find } from '../../../../backend/mysql/models/Walmart/Tiendas'
import { get_all_generic } from 'lib/apiGeneric'

const index = async (req, res) => {
	const { method } = req

	switch (method) {
	case 'GET':
		return get_all_generic(res, find)

	default:
		return res
			.status(CODE_HTTP._400)
			.json({ msg: 'This method is not supported' })
	}
}

export default index

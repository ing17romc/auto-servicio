import { CODE_HTTP } from 'constants/index'
import { getTotalesAnioSemana } from '../../../../../backend/mysql/models/Walmart/Tabular'
import { get_all_generic } from 'lib/apiGeneric'

const index = async (req, res) => {
	const { method } = req

	switch (method) {
	case 'GET':
		return get_all_generic(res, getTotalesAnioSemana)

	default:
		return res
			.status(CODE_HTTP._400)
			.json({ msg: 'This method is not supported' })
	}
}

export default index

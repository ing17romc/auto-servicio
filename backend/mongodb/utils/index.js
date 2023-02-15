export const formattingResult = (result) => {
	const obj = result.toObject()

	return {
		id: obj._id.toString(),
		nombre: obj.nombre,
		estado: obj.estado
	}
}

export const formattingResults = (results) => {
	const result = results.map((doc) => {
		return formattingResult(doc)
	})
	return result
}

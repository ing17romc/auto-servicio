import mongoose from 'mongoose'
import dbConnect from '../'
import { formattingResult, formattingResults } from '../utils'

/* PetSchema will correspond to a collection in your MongoDB database. */
const MateriasSchema = new mongoose.Schema({
	nombre: String,
	estado: Number
})

const Materias = mongoose.models.Materias || mongoose.model('Materias', MateriasSchema)

export const find = async () => {
	await dbConnect()

	const data = await Materias.find({})

	return formattingResults(data)
}
export const save = async ({ nombre, estado }) => {
	await dbConnect()

	const newData = new Materias({ nombre, estado })

	return await newData.save()
}
export const findById = async (id) => {
	await dbConnect()

	const data = await Materias.findOne({ _id: id })

	return formattingResult(data)
}

export const update = async ({ id, nombre, estado }) => {
	await dbConnect()

	return await Materias.updateOne({ _id: id }, { nombre, estado }, {
		new: true,
		runValidators: true
	})
}
export const deleteById = async (id) => {
	await dbConnect()

	return await Materias.deleteOne({ _id: id })
}

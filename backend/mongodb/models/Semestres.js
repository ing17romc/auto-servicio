import mongoose from 'mongoose'
import dbConnect from '../'
import { formattingResult, formattingResults } from '../utils'

/* PetSchema will correspond to a collection in your MongoDB database. */
const SemestresSchema = new mongoose.Schema({
	nombre: String,
	estado: Number
})

const Semestres = mongoose.models.Semestres || mongoose.model('Semestres', SemestresSchema)

export const find = async () => {
	await dbConnect()

	const data = await Semestres.find({})

	return formattingResults(data)
}
export const save = async ({ nombre, estado }) => {
	await dbConnect()

	const newData = new Semestres({ nombre, estado })

	return await newData.save()
}
export const findById = async (id) => {
	await dbConnect()

	const data = await Semestres.findOne({ _id: id })

	return formattingResult(data)
}

export const update = async ({ id, nombre, estado }) => {
	await dbConnect()

	return await Semestres.updateOne({ _id: id }, { nombre, estado }, {
		new: true,
		runValidators: true
	})
}
export const deleteById = async (id) => {
	await dbConnect()

	return await Semestres.deleteOne({ _id: id })
}

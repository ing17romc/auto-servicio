import mongoose from 'mongoose'
import dbConnect from '../'
import { formattingResult, formattingResults } from '../utils'

/* PetSchema will correspond to a collection in your MongoDB database. */
const CarrerasSchema = new mongoose.Schema({
	nombre: String,
	estado: Number
})

const Carreras = mongoose.models.Carreras || mongoose.model('Carreras', CarrerasSchema)

export const find = async () => {
	await dbConnect()

	const data = await Carreras.find({})

	return formattingResults(data)
}
export const save = async ({ nombre, estado }) => {
	await dbConnect()

	const newData = new Carreras({ nombre, estado })

	return await newData.save()
}
export const findById = async (id) => {
	await dbConnect()

	const data = await Carreras.findOne({ _id: id })

	return formattingResult(data)
}

export const update = async ({ id, nombre, estado }) => {
	await dbConnect()

	return await Carreras.updateOne({ _id: id }, { nombre, estado }, {
		new: true,
		runValidators: true
	})
}
export const deleteById = async (id) => {
	await dbConnect()

	return await Carreras.deleteOne({ _id: id })
}

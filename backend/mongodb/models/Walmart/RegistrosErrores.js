import mongoose from 'mongoose'
import dbConnect from '../../'

/* PetSchema will correspond to a collection in your MongoDB database. */
const LogSchema = new mongoose.Schema({
	file: String,
	sheet: String,
	type: String,
	message: String,
	description: String
})

const Log = mongoose.models.Log || mongoose.model('Log', LogSchema)

export const find = async () => {
	await dbConnect()

	const result = await Log.find({})

	return result
}
export const save = async ({ file, sheet, type, message, description }) => {
	await dbConnect()

	const newData = new Log({ file, sheet, type, message, description })

	return await newData.save()
}
export const findById = async (id) => {
	await dbConnect()

	const result = await Log.findOne({ _id: id })

	return result
}

export const update = async ({ id, file, sheet, type, message, description }) => {
	await dbConnect()

	return await Log.updateOne({ _id: id }, { file, sheet, type, message, description }, {
		new: true,
		runValidators: true
	})
}
export const deleteById = async (id) => {
	await dbConnect()

	return await Log.deleteOne({ _id: id })
}

export const deleteAll = async (file) => {
	await dbConnect()

	return await Log.deleteMany({})
}

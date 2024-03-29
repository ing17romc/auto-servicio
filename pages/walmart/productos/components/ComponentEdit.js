import { UI, functions } from 'edt-lib'
import Form from 'components/Form'
import Error from 'next/error'
import { useState } from 'react'
import { STATUS as ESTADOS } from '../../../../constants'
import { CONTENT } from 'content'

const { GENERIC } = CONTENT

const ComponentEdit = ({ id = 0, newId = 0, nombre = '', estado = 1, idCeroHumedadProducto = 0, pathRetun, api, title, products = [], error }) => {
	if (error && error.statusCode) { return <Error statusCode={error.statusCode} title={error.statusText} /> }

	const { TextBox, Selector } = UI

	const [state, setstate] = useState({
		newId,
		nombre,
		estado,
		idCeroHumedadProducto
	})

	const { getValueInput } = functions

	const onInputChange = e => {
		const object = getValueInput(e)
		if (e) {
			setstate({
				...state,
				[object.key]: object.value
			})
		}
	}

	const getProducts = () => {
		const list = [{ key: '0', value: GENERIC.SELECCIONAR }]
		for (const product of products) {
			list.push({ key: product.id.toString(), value: product.nombre })
		}
		return list
	}

	return (
		<Form
			id={id}
			state={state}
			pathRetun={pathRetun}
			title={title}
			api={api}

			disabled={!state.nombre || state.idCeroHumedadProducto === 0 || state.idCeroHumedadProducto === '0' }
		>
			<div className='start-1 size-6 padding-v-20'>
				<TextBox
					id='newId'
					value={state.newId.toString()}
					eventChange={e => onInputChange(e)}
					titleBottom='id'
				/>
			</div>
			<div className='size-6 padding-v-20'>
				<TextBox
					id='nombre'
					value={state.nombre}
					eventChange={e => onInputChange(e)}
					titleBottom='Nombre'
				/>
			</div>

			<div className='start-1 size-6 padding-v-20'>
				<Selector
					id='idCeroHumedadProducto'
					value={state.idCeroHumedadProducto}
					options={getProducts()}
					eventChange={e => onInputChange(e)}
					titleBottom='producto original'
				/>
			</div>

			<div className='size-6 padding-v-20'>
				<Selector
					id='estado'
					value={state.estado}
					options={ESTADOS}
					eventChange={e => onInputChange(e)}
					titleBottom='Estado'
				/>
			</div>
		</Form>
	)
}

export default ComponentEdit

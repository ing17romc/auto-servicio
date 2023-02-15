import { UI, functions } from 'edt-lib'
import Form from 'components/Form'
import Error from 'next/error'
import { useState } from 'react'
import { STATUS as ESTADOS } from '../constants'

const GenericEdit = ({ id = 0, nombre = '', estado = 1, pathRetun, api, title, error }) => {
	if (error && error.statusCode) { return <Error statusCode={error.statusCode} title={error.statusText} /> }

	const { TextBox, Selector } = UI

	const [state, setstate] = useState({
		nombre,
		estado
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
					id='nombre'
					value={state.nombre}
					eventChange={e => onInputChange(e)}
					titleBottom='Nombre'
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

export default GenericEdit

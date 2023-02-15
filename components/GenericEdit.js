
import { UI, functions } from 'edt-lib'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { STATUS as ESTADOS } from '../constants'

const GenericEdit = ({
	id = 0,
	nombre = '',
	estado = 1,
	pathRetun,
	title,
	api
}) => {
	const router = useRouter()
	const { Title, TextBox, Selector, Button } = UI

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

	const handleSubmit = async e => {
		e.preventDefault()

		if (id === 0) {
			await createElement()
		} else {
			await updateElement()
		}

		await router.push(pathRetun)
	}

	const createElement = async () => {
		try {
			await fetch(api, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(state)
			})
		} catch (error) {
			console.error(error)
		}
	}

	const updateElement = async () => {
		try {
			await fetch(`${api}/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(state)
			})
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<div className='container-body'>
				<div className='grid-primary '>
					<div className='start-1 size-12 padding-v-20'>
						<Title label={title} />
					</div>

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

					<div className='start-1 size-3 padding-v-20'>
						<Button
							title='Regresar'
							type='secondary'
							onClick={() => router.push(pathRetun)}
						/>
					</div>

					<div className='size-3 padding-v-20'>
						<Button
							title='Guardar'
							type='primary'
							disabled={!state.nombre}
						/>
					</div>
				</div>
			</div>
		</form>
	)
}

export default GenericEdit

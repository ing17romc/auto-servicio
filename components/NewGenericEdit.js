
import { UI } from 'edt-lib'
import { useRouter } from 'next/router'

const NewGenericEdit = ({
	id = 0,
	state,
	pathRetun,
	title,
	api,
	disabled,
	children
}) => {
	const router = useRouter()
	const { Title, Button } = UI

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
			console.log(state)
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
			console.log(state)
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

					{children}

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
							disabled={disabled}
						/>
					</div>
				</div>
			</div>
		</form>
	)
}

export default NewGenericEdit

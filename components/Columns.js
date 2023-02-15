import React from 'react'
import { UI } from 'edt-lib'
import { useRouter } from 'next/router'
import { getStatus } from 'lib/utils'

export const ColumnStatus = ({ width, estado, path }) => {
	return 	<td style={{ width }}>
		<div
			className={
				!estado
					? 'font-bold font-red'
					: 'font-bold font-green'
			}
		>
			{getStatus(estado)}
		</div>
	</td>
}

export const ColumnRemove = ({ width, id, api, path }) => {
	const router = useRouter()

	const deleteElement = async () => {
		try {
			await fetch(`${api}/${id}`, {
				method: 'DELETE'
			})
			router.push(`${path}`)
		} catch (error) {
			console.error(error)
		}
	}

	return 	<td style={{ width }}>
		{' '}
		<UI.ImageButton
			id="delete"
			icon="delete"
			text="eliminar"
			size="sm"
			onClick={() => deleteElement()}
		/>{' '}
	</td>
}

export const ColumnEdit = ({ width, id, path }) => {
	const router = useRouter()

	return 	<td style={{ width }}>
		{' '}
		<UI.ImageButton
			id="mode_edit"
			icon="mode_edit"
			text="editar"
			size="sm"
			onClick={() => router.push(`${path}/${id}`)}
		/>{' '}
	</td>
}

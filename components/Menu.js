import React from 'react'
import { useRouter } from 'next/router'
import { UI } from 'edt-lib'

const Menu = ({ options }) => {
	const router = useRouter()

	return (
		<UI.Menu options={options} getCurrentPath={(path) => router.push(path)} />
	)
}

export default Menu

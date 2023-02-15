import React from 'react'
import { useRouter } from 'next/router'
import { UI } from 'edt-lib'
import { CONFIG } from 'config'
import {
	useAuthUser
} from 'next-firebase-auth'
const { EXIT_APP } = CONFIG.ROUTER

const NavBar = ({ leftOptions, rightOptions }) => {
	const router = useRouter()
	const AuthUser = useAuthUser()

	const event = (path) => {
		console.log(path === EXIT_APP, path, EXIT_APP)
		if (path === EXIT_APP) {
			AuthUser.signOut()
		} else {
			router.push(path)
		}
	}

	return (
		<UI.NavBar
			leftOptions={leftOptions}
			rightOptions={rightOptions}
			currentPath={router.asPath}
			getCurrentPath={(path) => event(path)}
		/>
	)
}

export default NavBar

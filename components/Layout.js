
import { UI } from 'edt-lib'
import { useRouter } from 'next/router'
import { LEFT_OPTIONS, RIGHT_OPTIONS, MENU_OPTIONS } from '../constants'
import { CONFIG } from 'config'
import {
	useAuthUser
} from 'next-firebase-auth'
const { USUARIOS } = CONFIG.ROUTER
const { EXIT_APP, START_APP } = CONFIG.ROUTER

const Layout = ({ children, breadcrumbOptions = [] }) => {
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

	const getRightOptions = () => {
		if (AuthUser.email) {
			const element = { path: USUARIOS.USER, name: AuthUser.email, icon: 'person' }
			if (!RIGHT_OPTIONS.find(element => element.name === AuthUser.email)) { RIGHT_OPTIONS.push(element) }
		}
		return RIGHT_OPTIONS
	}

	return <UI.LayoutV2
		leftOptions={LEFT_OPTIONS}
		sideOptions={MENU_OPTIONS}
		showSideBar={router.asPath === START_APP}
		rightOptions={getRightOptions()}
		getCurrentPath={(path) => event(path)}
		breadcrumbOptions={breadcrumbOptions}
	>
		{children}
	</UI.LayoutV2>
}

export default Layout

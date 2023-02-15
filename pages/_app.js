import React from 'react'
import Head from 'next/head'
import { UI } from 'edt-lib'
import Router from 'next/router'
import initAuth from '../initAuth'

import 'edt-lib/index.scss'

initAuth()

function MyApp ({ Component, pageProps }) {
	const [loading, setLoading] = React.useState(false)
	React.useEffect(() => {
		const start = () => {
			// console.log('start')
			setLoading(true)
		}
		const end = () => {
			// console.log('findished')
			setLoading(false)
		}
		Router.events.on('routeChangeStart', start)
		Router.events.on('routeChangeComplete', end)
		Router.events.on('routeChangeError', end)
		return () => {
			Router.events.off('routeChangeStart', start)
			Router.events.off('routeChangeComplete', end)
			Router.events.off('routeChangeError', end)
		}
	}, [])
	return (
		<>
			<Head>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Icons"
					rel="stylesheet"
				/>
			</Head>
			<UI.Spinner show={loading}/>
			<Component {...pageProps} />

		</>
	)
}

export default MyApp

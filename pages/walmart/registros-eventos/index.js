
import Layout from 'components/Layout'
import { CONTENT } from 'content'
import { CONFIG } from 'config'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'
import { UI, functions } from 'edt-lib'
import React, { useState } from 'react'

const { TITLE } = CONTENT.WALMART.REGISTROS_ERRORES
const { REGISTROS_ERRORES: API_LOGS } = CONFIG.API.WALMART

const tableHeaders = <tr>
	<th style={{ width: '10%' }}>type</th>
	<th style={{ width: '45%' }}>file</th>
	<th style={{ width: '45%' }}>message</th>
</tr>



const index = ({ data, options }) => {
	const { Title } = UI

	const { getValueInput } = functions
	const [state, setstate] = useState({
		page: 1,
		pages: 500,
		dt: data,
		file: ''
	})
	// const [modal, setModal] = useState(false)

	const getSlides = (acc, cur, slidesPerView) => {
		if (!Array.isArray(acc) || !Array.isArray(cur) || !slidesPerView) { return [] }

		if (cur.length) {
			acc.push(cur.slice(0, slidesPerView))
			getSlides(acc, cur.slice(slidesPerView, cur.length), slidesPerView)
		}
		return acc
	}

	const pages = getSlides([], state.dt, state.pages)

	const getIndex = pages.length < state.page ? 0 : state.page - 1

	const onInputChange = e => {
		const object = getValueInput(e)

		const arr = []
		if (object.key === 'file') {
			data.forEach(element => {
				if (element.file === object.value) {
					arr.push(element
					)
				}
			})
		}

		if (e) {
			setstate({
				...state,
				[object.key]: object.value,
				page: 1,
				dt: object.key === 'file' ? arr : state.dt
			})
		}
	}

	const showModal = (element) => {
		console.log(element)
		alert(element._id)
	}

	const getRows = (pages, getIndex) => {
		if (pages.length === 0) return <tr></tr>
		return pages[getIndex].map((element, i) => (
			<tr key={i}
				className='active'
				onClick={() =>
					showModal(element)
				}>
				<td style={{ width: '10%' }}>{element.type}</td>
				<td style={{ width: '45%' }}>{element.file}</td>
				<td style={{ width: '45%' }}>{element.message}</td>
			</tr>
		))
	}

	return (
		<Layout>
			<div className="container-body">
				<div className="grid-primary ">
					<div className="start-1 size-12 padding-v-20">
						<Title label={TITLE} />
					</div>

					<div className="start-1  padding-v-30" />
					<div className="grid-secondary bg-light-gray elevated">
						<div className="start-1 size-8 padding-v-30">
							<h3> Filtros... </h3>
						</div>

						<div className="start-1 size-18 padding-v-20">
							<UI.Selector
								id='file'
								value={state.file}
								options={options}
								eventChange={e => onInputChange(e)}
								titleTop='Producto'
							/>
						</div>

						<div className="start-21 size-4 padding-v-20">
							<UI.Selector
								id='pages'
								value={state.pages.toString()}
								options={[
									{ key: '100', value: '100' },
									{ key: '200', value: '200' },
									{ key: '300', value: '300' },
									{ key: '400', value: '400' },
									{ key: '500', value: '500' }
								]}
								eventChange={e => onInputChange(e)}
								titleTop='Registros por pagina'
							/>
						</div>

						<div className='start-1 size-24 padding-v-20 center'>
							<UI.Pagination
								totalCount= {pages.length}
								currentPage= {state.page}
								onPageChange= {currentPage => setstate({ ...state, page: currentPage })}
							/>
						</div>

						<div className="start-1 size-24 padding-v-20 ">
							<div className='bg-white padding-h-30 padding-v-30'>
								<table className="">
									<tbody>
										{tableHeaders}
										{getRows(pages, getIndex)}
									</tbody>
								</table>
							</div>
							<div className="padding-v-20"></div>
						</div>

						<div className='start-1 size-24 padding-v-20 center'>
							<UI.Pagination
								totalCount= {pages.length}
								currentPage= {state.page}
								onPageChange= {currentPage => setstate({ ...state, page: currentPage })}
							/>
						</div>
					</div>

					<div className="start-1 padding-v-20" />
				</div>
			</div>
			{/*

				<UI.Modal show={modal} eventModal={() => setModal(!modal)}>
					<div className='padding-v-40 padding-h-40'>
						<h1>Example Modal!</h1>
					</div>
				</UI.Modal>
							*/}
		</Layout>
	)
}

export const getServerSideProps = withAuthUserTokenSSR({
	whenUnauthed: AuthAction.REDIRECT_TO_LOGIN
})(async () => {
	try {
		console.log(API_LOGS)
		const response = await fetch(API_LOGS)
		const responseJSON = await response.json()

		console.log('REGISTROS_ERRORES', responseJSON.result)

		const options = []

		for (const iterator of responseJSON.result) {
			if (!options.some(value => value.key === iterator.file.toString())) {
				options.push({ key: `${iterator.file}`, value: `${iterator.file}` })
			}
		}

		return { props: { data: responseJSON.result, options } }
	} catch (error) {
		console.log(error)
		return { props: { data: [], options: [] } }
	}
})

export default withAuthUser({
	whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN
})(index)

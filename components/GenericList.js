import { UI } from 'edt-lib'
import { useRouter } from 'next/router'
import { CONFIG } from 'config'
import { CONTENT } from 'content'

const { CREAR } = CONFIG.ROUTER
const { GENERIC } = CONTENT

const GenericList = ({ title, children, path, returnPath }) => {
	const router = useRouter()
	const { Title, ImageButton } = UI

	return (
		<div className="container-body">
			<div className="grid-primary ">
				<div className="start-1 size-12 padding-v-20">
					<Title label={title} />
				</div>

				<div className="start-1  padding-v-30" />
				<div className="grid-secondary bg-light-gray elevated">
					<div className="start-1 size-10 padding-v-30">
						<h3> {GENERIC.LISTADO} </h3>
					</div>

					<div className="start-23 size-1 padding-v-20">
						<ImageButton
							id="keyboard_return"
							icon="keyboard_return"
							text={GENERIC.RETORNAR}
							size="sm"
							onClick={() => router.push(returnPath)}
						/>
					</div>

					<div className=" size-1 padding-v-20">
						<ImageButton
							id="add"
							icon="add"
							text={GENERIC.AGREGAR_ELEMENTO}
							size="sm"
							onClick={() => router.push(`${path}${CREAR}`)}
						/>
					</div>

					<div className="start-1 size-24 padding-v-20 ">
						<div className='bg-white padding-h-30 padding-v-30'>
							<table>
								<tbody>
									{children}
								</tbody>
							</table>
						</div>
						<div className="padding-v-20"></div>
					</div>
				</div>

				<div className="start-1 padding-v-20" />
			</div>
		</div>
	)
}

export default GenericList

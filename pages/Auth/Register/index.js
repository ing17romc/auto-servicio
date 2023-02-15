
import Auth from 'components/Auth'
import {
	AuthAction,
	withAuthUser,
	withAuthUserTokenSSR
} from 'next-firebase-auth'

const index = () => (
	<Auth type="register" />
)

const style = {
	backgroundColor: 'white',
	width: '100%',
	height: '100%'
}

const Loader = () => <div style={style}/>

export const getServerSideProps = withAuthUserTokenSSR({
	whenAuthed: AuthAction.REDIRECT_TO_APP
})()

export default withAuthUser({
	whenAuthed: AuthAction.REDIRECT_TO_APP,
	whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
	whenUnauthedAfterInit: AuthAction.RENDER,
	LoaderComponent: Loader
})(index)

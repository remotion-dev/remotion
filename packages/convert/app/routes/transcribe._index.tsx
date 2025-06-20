import App from '~/components/transcribe/App';

const Main = () => {
	return <App />;
};

export default Main;

/* comment this out for development
export const headers: HeadersFunction = ({}) => ({
	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Opener-Policy': 'same-origin',
});
*/

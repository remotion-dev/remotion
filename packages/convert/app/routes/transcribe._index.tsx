import type {HeadersFunction} from '@remix-run/node';
import App from '~/components/transcribe/App';

const Main = () => {
	return <App />;
};

export default Main;

export const headers: HeadersFunction = ({
	actionHeaders,
	errorHeaders,
	loaderHeaders,
	parentHeaders,
}) => ({
	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Opener-Policy': 'same-origin',
});

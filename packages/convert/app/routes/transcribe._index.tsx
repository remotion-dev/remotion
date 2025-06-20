import {Main} from '~/components/Main';
import type {RouteAction} from '~/seo';

const action: RouteAction = {
	type: 'transcribe',
};

const Index = () => {
	return <Main routeAction={action} />;
};

export default Index;

import type {HeadersFunction} from '@remix-run/node';
export const headers: HeadersFunction = () => ({
	'Cross-Origin-Embedder-Policy': 'require-corp',
	'Cross-Origin-Opener-Policy': 'same-origin',
});

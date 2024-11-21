import type {MetaFunction} from '@remix-run/node';
import {Main} from '~/components/Main';

export const meta: MetaFunction = () => {
	return [
		{title: 'Remotion Convert'},
		{name: 'description', content: 'Fast video conversion in the browser.'},
	];
};

const Index = () => {
	return <Main />;
};

export default Index;

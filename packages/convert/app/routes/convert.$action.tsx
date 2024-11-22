import {useParams} from '@remix-run/react';
import {Main} from '~/components/Main';
import {getHeaderTitle, getPageTitle, parseRouteAction} from '~/seo';

const Index = () => {
	const {input, output} = parseRouteAction(useParams().action as string);

	return (
		<Main
			pageTitle={getPageTitle({input, output, type: 'convert'})}
			headerTitle={getHeaderTitle({input, output, type: 'convert'})}
		/>
	);
};

export default Index;

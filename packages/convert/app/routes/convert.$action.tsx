import {useParams} from '@remix-run/react';
import {useMemo} from 'react';
import {Main} from '~/components/Main';
import {parseRouteAction, RouteAction} from '~/seo';

const Index = () => {
	const action = useParams().action as string;

	const routeAction: RouteAction = useMemo(() => {
		const {input, output} = parseRouteAction(action);

		return {
			type: 'convert',
			input,
			output,
		};
	}, [action]);

	return <Main routeAction={routeAction} />;
};

export default Index;

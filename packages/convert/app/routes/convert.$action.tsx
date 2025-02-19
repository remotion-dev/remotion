import {useParams} from '@remix-run/react';
import {useMemo} from 'react';
import {Main} from '~/components/Main';
import type { RouteAction} from '~/seo';
import {parseConvertRouteAction} from '~/seo';

const Index = () => {
	const action = useParams().action as string;

	const routeAction: RouteAction = useMemo(() => {
		const {input, output} = parseConvertRouteAction(action);

		return {
			type: 'convert',
			input,
			output,
		};
	}, [action]);

	return <Main routeAction={routeAction} />;
};

export default Index;

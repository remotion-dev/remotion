import {useParams} from '@remix-run/react';
import {useMemo} from 'react';
import {Main} from '~/components/Main';
import type {OutputContainer, RouteAction} from '~/seo';

const Index = () => {
	const format = useParams().format as OutputContainer;

	const routeAction: RouteAction = useMemo(() => {
		return {
			type: 'resize-format',
			format,
		};
	}, [format]);

	return <Main routeAction={routeAction} />;
};

export default Index;

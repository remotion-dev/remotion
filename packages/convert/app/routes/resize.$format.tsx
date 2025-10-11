import {useParams} from '@remix-run/react';
import type {ConvertMediaContainer} from '@remotion/webcodecs';
import {useMemo} from 'react';
import {Main} from '~/components/Main';
import type {RouteAction} from '~/seo';

const Index = () => {
	const format = useParams().format as ConvertMediaContainer;

	const routeAction: RouteAction = useMemo(() => {
		return {
			type: 'resize-format',
			format,
		};
	}, [format]);

	return <Main routeAction={routeAction} />;
};

export default Index;

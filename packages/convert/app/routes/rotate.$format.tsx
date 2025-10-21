import {useParams} from '@remix-run/react';
import {useMemo} from 'react';
import {Main} from '~/components/Main';
import type {InputContainer, RouteAction} from '~/seo';

const Index = () => {
	const format = useParams().format as InputContainer;

	const routeAction: RouteAction = useMemo(() => {
		return {
			type: 'rotate-format',
			format,
		};
	}, [format]);

	return <Main routeAction={routeAction} />;
};

export default Index;

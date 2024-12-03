import {Main} from '~/components/Main';
import {RouteAction} from '~/seo';

const action: RouteAction = {
	type: 'generic-convert',
};

const Index = () => {
	return <Main routeAction={action} />;
};

export default Index;

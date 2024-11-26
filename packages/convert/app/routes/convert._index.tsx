import {Main} from '~/components/Main';
import {getHeaderTitle, getPageTitle} from '~/seo';

const Index = () => {
	return (
		<Main headerTitle={getHeaderTitle(null)} pageTitle={getPageTitle(null)} />
	);
};

export default Index;

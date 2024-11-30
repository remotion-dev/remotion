import {Main} from '~/components/Main';
import {getHeaderTitle, getPageTitle} from '~/seo';

const Index = () => {
	return (
		<Main
			headerTitle={getHeaderTitle({type: 'generic-convert'})}
			pageTitle={getPageTitle({type: 'generic-convert'})}
		/>
	);
};

export default Index;

import {Main} from '~/components/Main';
import {getHeaderTitle, getPageTitle} from '~/seo';

const Index = () => {
	return (
		<Main
			headerTitle={getHeaderTitle({type: 'generic-rotate'})}
			pageTitle={getPageTitle({type: 'generic-rotate'})}
		/>
	);
};

export default Index;

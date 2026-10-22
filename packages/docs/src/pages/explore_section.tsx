import '@remotion/promo-pages/dist/tailwind.css';
import {ExploreSection} from '@remotion/promo-pages/dist/ExploreSection.js';
import Layout from '@theme/Layout';
import React from 'react';

const ExploreSectionPage: React.FC = () => {
	return (
		<Layout title="Explore Remotion">
			<ExploreSection />
		</Layout>
	);
};

export default ExploreSectionPage;

import {useColorMode} from '@docusaurus/theme-common';
import '@remotion/promo-pages/dist/Homepage.css';
import {NewLanding} from '@remotion/promo-pages/dist/Homepage.js';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme/Layout';
import React from 'react';

const Inner: React.FC = () => {
	const {colorMode, setColorMode} = useColorMode();

	return (
		<NewLanding
			colorMode={colorMode}
			setColorMode={setColorMode}
			experimental
		/>
	);
};

const ExperimentalHomepage: React.FC = () => {
	return (
		<Layout noIndex>
			<Inner />
		</Layout>
	);
};

export default ExperimentalHomepage;

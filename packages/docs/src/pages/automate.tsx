import {useColorMode} from '@docusaurus/theme-common';
import '@remotion/promo-pages/dist/Automate.css';
import {AutomatePage} from '@remotion/promo-pages/dist/Automate.js';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme/Layout';
import React from 'react';

const Inner: React.FC = () => {
	const {colorMode, setColorMode} = useColorMode();

	return <AutomatePage colorMode={colorMode} setColorMode={setColorMode} />;
};

const Automate: React.FC = () => {
	return (
		<Layout
			title="Automate videos with Remotion"
			description="Create videos programmatically with Remotion. Try the interactive demo, explore apps built with Remotion, and find the right license."
		>
			<Inner />
		</Layout>
	);
};

export default Automate;

import {useColorMode} from '@docusaurus/theme-common';
import '@remotion/promo-pages/dist/Homepage.css';
import {NewLanding} from '@remotion/promo-pages/dist/Homepage.js';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme/Layout';
import React from 'react';

if (
	typeof window !== 'undefined' &&
	window.location?.origin?.includes('convert.remotion.dev')
) {
	window.location.href = 'https://remotion.dev/convert';
}

const Inner: React.FC = () => {
	let colorMode = 'light';
	let setColorMode = () => {};
	
	try {
		const colorModeHook = useColorMode();
		colorMode = colorModeHook.colorMode;
		setColorMode = colorModeHook.setColorMode;
	} catch (error) {
		// Fallback to light mode if context is not available
		console.warn('useColorMode context not available, falling back to light mode');
	}

	return <NewLanding colorMode={colorMode} setColorMode={setColorMode} />;
};

const Homepage: React.FC = () => {
	return (
		<Layout>
			<Inner />
		</Layout>
	);
};

export default Homepage;

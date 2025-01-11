import '@remotion/promo-pages/dist/Homepage.css';
import Homepage from '@remotion/promo-pages/dist/Homepage.js';
import '@remotion/promo-pages/dist/tailwind.css';
import Layout from '@theme/Layout';
import React from 'react';

if (
	typeof window !== 'undefined' &&
	window.location?.origin?.includes('convert.remotion.dev')
) {
	window.location.href = 'https://remotion.dev/convert';
}

const NewLanding: React.FC = () => {
	return (
		<Layout>
			<Homepage />
		</Layout>
	);
};

export default NewLanding;

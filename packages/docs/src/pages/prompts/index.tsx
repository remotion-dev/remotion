import Head from '@docusaurus/Head';
import {PromptsGalleryPage} from '@remotion/promo-pages/dist/prompts/PromptsGallery.js';
import Layout from '@theme/Layout';
import React from 'react';

export default () => {
	return (
		<Layout>
			<Head>
				<title>Remotion | Prompt Gallery</title>
				<meta
					name="description"
					content="Browse AI-generated video prompts for Remotion Skills."
				/>
			</Head>
			<PromptsGalleryPage />
		</Layout>
	);
};

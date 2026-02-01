import Head from '@docusaurus/Head';
import {PromptsShowPage} from '@remotion/promo-pages/dist/prompts/PromptsShow.js';
import Layout from '@theme/Layout';
import React from 'react';

export default () => {
	return (
		<Layout>
			<Head>
				<title>Remotion | Prompt</title>
				<meta
					name="description"
					content="View an AI-generated video prompt for Remotion."
				/>
			</Head>
			<PromptsShowPage />
		</Layout>
	);
};

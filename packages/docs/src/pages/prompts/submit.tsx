import Head from '@docusaurus/Head';
import {PromptsSubmitPage} from '@remotion/promo-pages/dist/prompts/PromptsSubmit.js';
import Layout from '@theme/Layout';
import React from 'react';

export default () => {
	return (
		<Layout>
			<Head>
				<title>Remotion | Submit a Prompt</title>
				<meta
					name="description"
					content="Submit your AI-generated video prompt to the Remotion gallery."
				/>
			</Head>
			<PromptsSubmitPage />
		</Layout>
	);
};

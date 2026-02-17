import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {PromptsSubmitPage} from '@remotion/promo-pages/dist/prompts/PromptsSubmit.js';
import Layout from '@theme/Layout';
import React from 'react';
import {Seo} from '../../components/Seo';

export default () => {
	const context = useDocusaurusContext();

	return (
		<Layout>
			<Head>
				{Seo.renderTitle('Submit a Prompt | Remotion')}
				{Seo.renderDescription(
					'Submit your AI-generated video prompt to the Remotion gallery.',
				)}
				{Seo.renderImage(
					'/generated/articles-prompts-submit.png',
					context.siteConfig.url,
				)}
			</Head>
			<PromptsSubmitPage />
		</Layout>
	);
};

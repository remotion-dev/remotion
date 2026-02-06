import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {PromptsGalleryPage} from '@remotion/promo-pages/dist/prompts/PromptsGallery.js';
import Layout from '@theme/Layout';
import React from 'react';
import {Seo} from '../../components/Seo';

export default () => {
	const context = useDocusaurusContext();

	return (
		<Layout>
			<Head>
				{Seo.renderTitle('Prompt Gallery | Remotion')}
				{Seo.renderDescription(
					'Browse AI-generated video prompts for Remotion Skills.',
				)}
				{Seo.renderImage(
					'/generated/articles-prompts-gallery.png',
					context.siteConfig.url,
				)}
			</Head>
			<PromptsGalleryPage />
		</Layout>
	);
};

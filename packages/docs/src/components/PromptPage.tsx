import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import '@remotion/promo-pages/dist/prompts/PromptsShow.css';
import {PromptsShowPage} from '@remotion/promo-pages/dist/prompts/PromptsShow.js';
import Layout from '@theme/Layout';
import React from 'react';
import prompts from '../../static/_raw/prompts.json';
import {Seo} from './Seo';

export default () => {
	const location = useLocation();
	const context = useDocusaurusContext();

	const slug = location.pathname.match(/\/prompts\/([^/]+)/)?.[1];
	const prompt = prompts.find((p) => p.slug === slug);

	const title = prompt?.title ?? 'Prompt';

	const getDescription = () => {
		if (!prompt) {
			return 'View an AI-generated video prompt for Remotion.';
		}

		const parts: string[] = [];
		if (prompt.toolUsed) {
			parts.push(`Made with ${prompt.toolUsed}`);
		}

		if (prompt.modelUsed) {
			parts.push(`using ${prompt.modelUsed}`);
		}

		if (parts.length > 0) {
			return `${parts.join(' ')}. An AI-generated Remotion video.`;
		}

		return `An AI-generated Remotion video prompt.`;
	};

	const description = getDescription();
	const ogImage = prompt
		? `https://image.mux.com/${prompt.muxPlaybackId}/thumbnail.png?width=1200&height=630&fit_mode=smartcrop`
		: '/generated/articles-prompts-gallery.png';

	return (
		<Layout>
			<Head>
				{Seo.renderTitle(`${title} | Remotion Prompts`)}
				{Seo.renderDescription(description)}
				{Seo.renderImage(ogImage, context.siteConfig.url)}
			</Head>
			<PromptsShowPage prompt={prompt} />
		</Layout>
	);
};

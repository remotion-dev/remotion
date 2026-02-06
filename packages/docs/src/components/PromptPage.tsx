import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {Submission} from '@remotion/promo-pages/dist/prompts/prompt-types';
import '@remotion/promo-pages/dist/prompts/PromptsShow.css';
import {PromptsShowPage} from '@remotion/promo-pages/dist/prompts/PromptsShow.js';
import Layout from '@theme/Layout';
import React from 'react';
import {Seo} from './Seo';

const prompts = require('../../static/_raw/prompts.json') as Submission[];

export default () => {
	const location = useLocation();
	const context = useDocusaurusContext();

	const slug = location.pathname.match(/\/prompts\/([^/]+)/)?.[1];
	const prompt = prompts.find((p) => p.slug === slug);

	const title = prompt?.title ?? 'Prompt';
	const description =
		prompt?.prompt?.slice(0, 150) ??
		'View an AI-generated video prompt for Remotion.';
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

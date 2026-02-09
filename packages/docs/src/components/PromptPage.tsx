import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import '@remotion/promo-pages/dist/prompts/PromptsShow.css';
import {PromptsShowPage} from '@remotion/promo-pages/dist/prompts/PromptsShow.js';
import Layout from '@theme/Layout';
import React from 'react';
import promptSubmissions from '../../static/_raw/prompt-submissions.json';
import {Seo} from './Seo';

export default () => {
	const location = useLocation();
	const context = useDocusaurusContext();

	const slug = location.pathname.match(/\/prompts\/([^/]+)/)?.[1];
	const promptSubmission = promptSubmissions.find((p) => p.slug === slug);

	const title = promptSubmission?.title ?? 'Prompt';

	const getDescription = () => {
		if (!promptSubmission) {
			return 'View an AI-generated video prompt for Remotion.';
		}

		const parts: string[] = [];
		if (promptSubmission.toolUsed) {
			parts.push(`Made with ${promptSubmission.toolUsed}`);
		}

		if (promptSubmission.modelUsed) {
			parts.push(`using ${promptSubmission.modelUsed}`);
		}

		if (parts.length > 0) {
			return `${parts.join(' ')}. An AI-generated Remotion video.`;
		}

		return `An AI-generated Remotion video prompt.`;
	};

	const description = getDescription();
	const ogImage = promptSubmission
		? `https://image.mux.com/${promptSubmission.muxPlaybackId}/thumbnail.png?width=1200&height=630&fit_mode=smartcrop`
		: '/generated/articles-prompts-gallery.png';

	return (
		<Layout>
			<Head>
				{Seo.renderTitle(`${title} | Remotion Prompts`)}
				{Seo.renderDescription(description)}
				{Seo.renderImage(ogImage, context.siteConfig.url)}
			</Head>
			<PromptsShowPage promptSubmission={promptSubmission} />
		</Layout>
	);
};

import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {PromptSubmission} from '@remotion/promo-pages/dist/prompts/prompt-types';
import {PromptsGalleryPage} from '@remotion/promo-pages/dist/prompts/PromptsGallery.js';
import Layout from '@theme/Layout';
import React from 'react';
import allPromptSubmissions from '../../../static/_raw/prompt-submissions.json';
import {Seo} from '../../components/Seo';

const PROMPTS_PER_PAGE = 12;

export default () => {
	const context = useDocusaurusContext();
	const totalPages = Math.ceil(allPromptSubmissions.length / PROMPTS_PER_PAGE);
	const promptSubmissions = (allPromptSubmissions as PromptSubmission[]).slice(
		0,
		PROMPTS_PER_PAGE,
	);

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
			<PromptsGalleryPage
				promptSubmissions={promptSubmissions}
				currentPage={1}
				totalPages={totalPages}
			/>
		</Layout>
	);
};

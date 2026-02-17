import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {PromptSubmission} from '@remotion/promo-pages/dist/prompts/prompt-types';
import {PromptsGalleryPage} from '@remotion/promo-pages/dist/prompts/PromptsGallery.js';
import Layout from '@theme/Layout';
import React from 'react';
import allPromptSubmissions from '../../static/_raw/prompt-submissions.json';
import {Seo} from './Seo';

const PROMPTS_PER_PAGE = 12;

export default () => {
	const location = useLocation();
	const context = useDocusaurusContext();

	const pageMatch = location.pathname.match(/\/prompts\/(\d+)$/);
	const currentPage = pageMatch ? parseInt(pageMatch[1], 10) : 1;
	const totalPages = Math.ceil(allPromptSubmissions.length / PROMPTS_PER_PAGE);

	const startIndex = (currentPage - 1) * PROMPTS_PER_PAGE;
	const promptSubmissions = (allPromptSubmissions as PromptSubmission[]).slice(
		startIndex,
		startIndex + PROMPTS_PER_PAGE,
	);

	const title =
		currentPage === 1
			? 'Prompt Gallery | Remotion'
			: `Prompt Gallery - Page ${currentPage} | Remotion`;

	return (
		<Layout>
			<Head>
				{Seo.renderTitle(title)}
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
				currentPage={currentPage}
				totalPages={totalPages}
			/>
		</Layout>
	);
};

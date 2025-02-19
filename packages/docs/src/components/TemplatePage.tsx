import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import Layout from '@theme/Layout';
import React from 'react';

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {CreateVideoInternals} from 'create-video';
import {Seo} from './Seo';
import {TemplateModalContent} from './TemplateModalContent';

const layout: React.CSSProperties = {
	maxWidth: 1200,
	margin: 'auto',
	paddingLeft: 16,
	paddingRight: 16,
};

export default () => {
	const location = useLocation();
	const context = useDocusaurusContext();

	const templatePathname = location.pathname.match(/templates\/([a-zA-Z-]+)/);

	if (!templatePathname) {
		throw new Error('no expert slug found');
	}

	const template = CreateVideoInternals.FEATURED_TEMPLATES.find(
		(e) => e.cliId === templatePathname[1],
	);
	// After Next.js is enabled we can throw an error instead
	if (!template) {
		return null;
	}

	const imgSrc = `/generated/template-${template.cliId}.png`;

	return (
		<Layout>
			<Head>
				{Seo.renderTitle(`${template.shortName} | Remotion Template`)}
				{Seo.renderDescription(template.description)}
				{Seo.renderImage(imgSrc, context.siteConfig.url)}
			</Head>
			<br />
			<div style={layout}>
				<TemplateModalContent template={template} />
			</div>
		</Layout>
	);
};

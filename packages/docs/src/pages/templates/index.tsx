import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {Templates} from '@remotion/promo-pages/dist/templates.js';
import Layout from '@theme/Layout';
import React from 'react';
import {Seo} from '../../components/Seo';

export default () => {
	const imgSrc = `/generated/template-all.png`;
	const context = useDocusaurusContext();

	return (
		<Layout>
			<Head>
				{Seo.renderTitle(`Starter Templates | Remotion`)}
				{Seo.renderDescription(
					'Jumpstart your Remotion project with a template.',
				)}
				{Seo.renderImage(imgSrc, context.siteConfig.url)}
			</Head>
			<Templates />
		</Layout>
	);
};

import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {ExpertsPageContent} from '@remotion/promo-pages/dist/experts.js';
import Layout from '@theme/Layout';
import React from 'react';
import {Seo} from '../../components/Seo';

const Experts: React.FC = () => {
	const context = useDocusaurusContext();

	return (
		<Layout>
			<Head>
				{Seo.renderTitle('Remotion Experts | Hire Remotion freelancers')}
				{Seo.renderDescription(
					'Find Remotion freelancers and hire them to create, progress or unblock your Remotion project.',
				)}
				{Seo.renderImage(
					'/img/remotion-experts-og-image.png',
					context.siteConfig.url,
				)}
			</Head>
			<ExpertsPageContent Link={Link} />
		</Layout>
	);
};

export default Experts;

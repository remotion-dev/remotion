import {PageMetadata} from '@docusaurus/theme-common';
import {LicenseQuizPage} from '@remotion/promo-pages/dist/LicenseQuiz.js';
import Layout from '@theme/Layout';
import React from 'react';

const LicenseQuiz: React.FC = () => {
	return (
		<Layout>
			<PageMetadata
				title="Which license is needed?"
				description="Answer a few questions to find out whether the Free License applies or a Company License is needed."
				image="https://remotion.media/docs/generated/articles-docs-license-which-license.png"
			/>
			<LicenseQuizPage />
		</Layout>
	);
};

export default LicenseQuiz;

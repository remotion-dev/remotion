import Head from '@docusaurus/Head';
import {DesignPage} from '@remotion/promo-pages/dist/design.js';
import Layout from '@theme/Layout';
import React from 'react';

export default () => {
	return (
		<Layout>
			<Head>
				<title>Remotion | About</title>
				<meta name="description" content="Remotion's story." />
			</Head>
			<DesignPage />
		</Layout>
	);
};

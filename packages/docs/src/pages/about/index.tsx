import Layout from '@theme/Layout';
import React from 'react';

import Head from '@docusaurus/Head';
import {TeamPage} from '@remotion/promo-pages/dist/Team.js';

export default () => {
	return (
		<Layout>
			<Head>
				<title>Remotion | About</title>
				<meta name="description" content="Remotion's story." />
			</Head>
			<TeamPage />
		</Layout>
	);
};

import Layout from '@theme/Layout';
import React from 'react';
import {AboutUsHeader} from '../../components/AboutUsHeader';

import Head from '@docusaurus/Head';
import {TitleTeamCards} from '../../components/TitleTeamCards';

const container: React.CSSProperties = {
	maxWidth: 1000,
	margin: 'auto',
	paddingLeft: 16,
	paddingRight: 16,
};

export default () => {
	return (
		<Layout>
			<br />
			<Head>
				<title>Remotion | About</title>
				<meta name="description" content="Remotion's story." />
			</Head>
			<div style={container}>
				<br />
				<AboutUsHeader />
				<br />
				<TitleTeamCards />
				<br />
			</div>
		</Layout>
	);
};

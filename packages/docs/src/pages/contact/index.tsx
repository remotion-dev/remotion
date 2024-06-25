import Layout from '@theme/Layout';
import React from 'react';
import {PlainButton} from '../../../components/layout/Button';
import {Spacer} from '../../../components/layout/Spacer';
import {ContactUsHeader} from '../../components/ContactUsHeader';
import GoogleMaps from '../../components/GoogleMaps';

import Head from '@docusaurus/Head';

const container: React.CSSProperties = {
	maxWidth: 1000,
	margin: 'auto',
	paddingLeft: 16,
	paddingRight: 16,
};

const button: React.CSSProperties = {
	color: 'white',
	fontFamily: 'GTPlanar',
	textDecoration: 'none',
};

export default () => {
	return (
		<Layout>
			<br />
			<Head>
				<title>Remotion | Contact</title>
				<meta name="description" content="Contact Remotion" />
			</Head>
			<div style={container}>
				<br />
				<ContactUsHeader />
				<div
					style={{
						textAlign: 'center',
						display: 'flex',
						justifyContent: 'left',
					}}
				>
					<a style={button} target="_blank" href="mailto:hi@remotion.dev">
						<PlainButton size="sm" loading={false} fullWidth={false}>
							Contact via email
						</PlainButton>
					</a>
					<Spacer />
					<Spacer />
					<a
						style={button}
						target="_blank"
						href="https://cal.com/remotion/evaluate"
					>
						<PlainButton size="sm" loading={false} fullWidth={false}>
							Schedule evaluation call
						</PlainButton>
					</a>
				</div>
				<br />
				<h2>Do you need technical support and want to chat?</h2>
				<p>
					On Discord, we provide technical support for Remotion. There we can
					quickly write messages back and forth in a public channel.
				</p>

				<p>
					Note: Please read our <a href="docs/support">Support Policy</a>.{' '}
					{"It's"} important to know that we {"don't"} offer troubleshooting
					help via DMs on Discord.
				</p>
				<div
					style={{
						textAlign: 'center',
						display: 'flex',
						justifyContent: 'left',
					}}
				>
					<a style={button} target="_blank" href="https://remotion.dev/discord">
						<PlainButton size="sm" loading={false} fullWidth={false}>
							Join Discord
						</PlainButton>
					</a>
				</div>
			</div>
			<GoogleMaps />
		</Layout>
	);
};

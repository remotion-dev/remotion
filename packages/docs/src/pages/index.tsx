import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import React from 'react';
import {VideoApps} from '../../components/LambdaSplash/VideoApps';
import {
	PricingTitle,
	VideoAppsTitle,
} from '../../components/LambdaSplash/VideoAppsTitle';
import {BackgroundAnimation} from '../../components/LandingPage/BackgroundAnimation';
import CommunityStats from '../../components/LandingPage/CommunityStats';
import EvaluateRemotionSection from '../../components/LandingPage/EvaluateRemotionSection';
import {NewsletterButton} from '../../components/LandingPage/NewsletterButton';
import {Pricing} from '../../components/LandingPage/Pricing';
import TrustedByBanner from '../../components/LandingPage/TrustedByBanner';
import {WriteInReact} from '../../components/LandingPage/WriteInReact';
import {LightningFastEditor} from '../../components/LandingPage/editor';
import {IfYouKnowReact} from '../../components/LandingPage/if-you-know-react';
import {Parametrize} from '../../components/LandingPage/parametrize';
import {RealMP4Videos} from '../../components/LandingPage/real-mp4-videos';
import {Demo} from '../components/Demo/Demo';
import styles from './landing.module.css';

const NewLanding: React.FC = () => {
	return (
		<Layout>
			<div>
				<Head>
					<title>Remotion | Make videos programmatically</title>
					<meta
						name="description"
						content="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more
          technologies to render videos programmatically!"
					/>
				</Head>
				<BackgroundAnimation />
				<br />
				<br />
				<br />
				<br />
				<div className={styles.content}>
					<WriteInReact />
					<br />
					<IfYouKnowReact />
					<br />
					<br />

					<Demo />
					<br />
					<br />
					<br />
					<RealMP4Videos />
					<br />
					<br />
					<br />
					<br />
					<LightningFastEditor />
					<br />
					<br />
					<br />
					<br />
					<Parametrize />
					<br />
					<br />
					<VideoAppsTitle />
					<VideoApps active="remotion" />
					<br />
					<br />
					<CommunityStats />
					<br />
					<br />
					<PricingTitle />
					<Pricing />
					<TrustedByBanner />
					<br />
					<EvaluateRemotionSection />
					<NewsletterButton />
					<br />
					<br />
					<br />
				</div>
			</div>
		</Layout>
	);
};

export default NewLanding;

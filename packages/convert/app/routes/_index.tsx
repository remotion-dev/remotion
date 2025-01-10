import React from 'react';
import {BackgroundAnimation} from '~/components/homepage/BackgroundAnimation';
import CommunityStats from '~/components/homepage/CommunityStats';
import {Demo} from '~/components/homepage/Demo';
import {LightningFastEditor} from '~/components/homepage/Editor';
import EvaluateRemotionSection from '~/components/homepage/EvaluateRemotion';
import {IfYouKnowReact} from '~/components/homepage/IfYouKnowReact';
import {NewsletterButton} from '~/components/homepage/NewsletterButton';
import {Pricing} from '~/components/homepage/Pricing';
import {RealMP4Videos} from '~/components/homepage/RealMp4Videos';
import TrustedByBanner from '~/components/homepage/TrustedByBanner';
import {VideoApps} from '~/components/homepage/VideoApps';
import VideoAppsShowcase from '~/components/homepage/VideoAppsShowcase';
import {
	PricingTitle,
	VideoAppsTitle,
} from '~/components/homepage/VideoAppsTitle';
import {WriteInReact} from '~/components/homepage/WriteInReact';
import '../components/homepage/custom.css';
import styles from '../components/landing.module.css';

if (
	typeof window !== 'undefined' &&
	window.location?.origin?.includes('convert.remotion.dev')
) {
	window.location.href = 'https://remotion.dev/convert';
}

const NewLanding: React.FC = () => {
	return (
		<div data-theme="light">
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
				<br />
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
				<VideoAppsTitle />
				<VideoApps active="remotion" />
				<br />
				<br />
				<VideoAppsShowcase />
				<br />
				<br />
				<Demo />
				<br />
				<br />
				<br />
				<PricingTitle />
				<Pricing />
				<TrustedByBanner />
				<br />
				<EvaluateRemotionSection />
				<br />
				<br />
				<br />
				<CommunityStats />
				<br />
				<br />
				<br />
				<NewsletterButton />
				<br />
				<br />
				<br />
			</div>
		</div>
	);
};

export default NewLanding;

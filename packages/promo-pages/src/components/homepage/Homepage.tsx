'use client';

import React from 'react';
import {BackgroundAnimation} from './BackgroundAnimation';
import CommunityStats from './CommunityStats';
import './custom.css';
import {Demo} from './Demo';
import {LightningFastEditor} from './Editor';
import EvaluateRemotionSection from './EvaluateRemotion';
import {IfYouKnowReact} from './IfYouKnowReact';
import styles from './landing.module.css';
import {ColorModeProvider} from './layout/use-color-mode';
import {NewsletterButton} from './NewsletterButton';
import {Pricing} from './Pricing';
import {RealMP4Videos} from './RealMp4Videos';
import TrustedByBanner from './TrustedByBanner';
import {VideoApps} from './VideoApps';
import VideoAppsShowcase from './VideoAppsShowcase';
import {PricingTitle, VideoAppsTitle} from './VideoAppsTitle';
import {WriteInReact} from './WriteInReact';

if (
	typeof window !== 'undefined' &&
	window.location?.origin?.includes('convert.remotion.dev')
) {
	window.location.href = 'https://remotion.dev/convert';
}

const NewLanding: React.FC = () => {
	return (
		<ColorModeProvider>
			<div>
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
		</ColorModeProvider>
	);
};

export default NewLanding;

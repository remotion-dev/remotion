'use client';

import React from 'react';
import {BackgroundAnimation} from './homepage/BackgroundAnimation';
import CommunityStats from './homepage/CommunityStats';
import './homepage/custom.css';
import {Demo} from './homepage/Demo';
import {LightningFastEditor} from './homepage/Editor';
import EvaluateRemotionSection from './homepage/EvaluateRemotion';
import {IfYouKnowReact} from './homepage/IfYouKnowReact';
import {ColorModeProvider} from './homepage/layout/use-color-mode';
import {NewsletterButton} from './homepage/NewsletterButton';
import {Pricing} from './homepage/Pricing';
import {RealMP4Videos} from './homepage/RealMp4Videos';
import TrustedByBanner from './homepage/TrustedByBanner';
import {VideoApps} from './homepage/VideoApps';
import VideoAppsShowcase from './homepage/VideoAppsShowcase';
import {PricingTitle, VideoAppsTitle} from './homepage/VideoAppsTitle';
import {WriteInReact} from './homepage/WriteInReact';

const NewLanding: React.FC = () => {
	return (
		<ColorModeProvider>
			<div data-theme="light" className="bg-[var(--background)] relative">
				<div>
					<div>
						<BackgroundAnimation />
					</div>
					<br />
					<br />
					<br />
					<br />
					<div className="max-w-[500px] lg:max-w-[1000px] m-auto pl-5 pr-5 relative">
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
			</div>
		</ColorModeProvider>
	);
};

export default NewLanding;

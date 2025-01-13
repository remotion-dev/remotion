'use client';

import React from 'react';
import {BackgroundAnimation} from './homepage/BackgroundAnimation';
import CommunityStats from './homepage/CommunityStats';
import './homepage/custom.css';
import {Demo} from './homepage/Demo';
import {LightningFastEditor} from './homepage/Editor';
import EvaluateRemotionSection from './homepage/EvaluateRemotion';
import {IfYouKnowReact} from './homepage/IfYouKnowReact';
import type {ColorMode} from './homepage/layout/use-color-mode';
import {ColorModeProvider} from './homepage/layout/use-color-mode';
import {NewsletterButton} from './homepage/NewsletterButton';
import {Pricing} from './homepage/Pricing';
import {RealMP4Videos} from './homepage/RealMp4Videos';
import TrustedByBanner from './homepage/TrustedByBanner';
import {VideoApps} from './homepage/VideoApps';
import VideoAppsShowcase from './homepage/VideoAppsShowcase';
import {SectionTitle, VideoAppsTitle} from './homepage/VideoAppsTitle';
import {WriteInReact} from './homepage/WriteInReact';

export const NewLanding: React.FC<{
	readonly colorMode: ColorMode;
	readonly setColorMode: (colorMode: ColorMode) => void;
}> = ({colorMode, setColorMode}) => {
	return (
		<ColorModeProvider colorMode={colorMode} setColorMode={setColorMode}>
			<div className="bg-[var(--background)] relative">
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
						<SectionTitle>Pricing</SectionTitle>
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

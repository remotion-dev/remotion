'use client';

import React from 'react';
import {BackgroundAnimation} from './homepage/BackgroundAnimation';
import CommunityStats from './homepage/CommunityStats';
import {Demo} from './homepage/Demo';
import EditorStarterSection from './homepage/EditorStarterSection';
import EvaluateRemotionSection from './homepage/EvaluateRemotion';
import {IfYouKnowReact} from './homepage/IfYouKnowReact';
import type {ColorMode} from './homepage/layout/use-color-mode';
import {ColorModeProvider} from './homepage/layout/use-color-mode';
import {MoreVideoPowerSection} from './homepage/MoreVideoPowerSection';
import {NewsletterButton} from './homepage/NewsletterButton';
import {ParameterizeAndEdit} from './homepage/ParameterizeAndEdit';
import {Pricing} from './homepage/Pricing';
import {RealMP4Videos} from './homepage/RealMp4Videos';
import TrustedByBanner from './homepage/TrustedByBanner';
import VideoAppsShowcase from './homepage/VideoAppsShowcase';
import {SectionTitle} from './homepage/VideoAppsTitle';
import {WriteInReact} from './homepage/WriteInReact';

export const NewLanding: React.FC<{
	readonly colorMode: ColorMode;
	readonly setColorMode: (colorMode: ColorMode) => void;
}> = ({colorMode, setColorMode}) => {
	return (
		<ColorModeProvider colorMode={colorMode} setColorMode={setColorMode}>
			<div className="bg-[var(--background)] relative">
				<div style={{overflow: 'hidden'}}>
					<div>
						<BackgroundAnimation />
					</div>
					<br />
					<br />
					<br />
					<br />
					<div className="max-w-[500px] lg:max-w-[1000px] m-auto pl-5 pr-5 overflow-x-clip md:overflow-x-visible relative">
						<WriteInReact />
						<br />
						<IfYouKnowReact />
						<ParameterizeAndEdit />
						<RealMP4Videos />
						<br />
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
						<EditorStarterSection />
						<br />
						<br />
						<br />

						<SectionTitle>Even more power to developers</SectionTitle>
						<div className={'fontbrand text-center mb-10 -mt-4'}>
							Innovative video products that you might enjoy.
						</div>
						<MoreVideoPowerSection />
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

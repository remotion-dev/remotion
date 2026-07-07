'use client';

import React from 'react';
import AutomationsSection from './homepage/AutomationsSection';
import {BackgroundAnimation} from './homepage/BackgroundAnimation';
import CommunityStats from './homepage/CommunityStats';
import {Demo} from './homepage/Demo';
import EvaluateRemotionSection from './homepage/EvaluateRemotion';
import type {ColorMode} from './homepage/layout/use-color-mode';
import {ColorModeProvider} from './homepage/layout/use-color-mode';
import {MakeVideosAgentically} from './homepage/MakeVideosAgentically';
import {MakeVideosInteractively} from './homepage/MakeVideosInteractively';
import {MakeVideosProgrammatically} from './homepage/MakeVideosProgrammatically';
import {NewsletterButton} from './homepage/NewsletterButton';
import {Pricing} from './homepage/Pricing';
import TrustedByBanner from './homepage/TrustedByBanner';
import {BuiltWithRemotionShowcase} from './homepage/VideoAppsShowcase';
import {SectionTitle} from './homepage/VideoAppsTitle';
import {WriteInReact} from './homepage/WriteInReact';

const makeVideosRowClassName = 'mt-4 md:mt-6 flex flex-col lg:flex-row gap-10';

export const NewLanding: React.FC<{
	readonly colorMode: ColorMode;
	readonly setColorMode: (colorMode: ColorMode) => void;
}> = ({colorMode, setColorMode}) => {
	return (
		<ColorModeProvider colorMode={colorMode} setColorMode={setColorMode}>
			<div className="w-full relative">
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
						<div className={makeVideosRowClassName}>
							<MakeVideosAgentically videoSrc="/img/homepage-assets-master.webm" />
							<MakeVideosInteractively />
							<MakeVideosProgrammatically
								links={[
									{label: 'API Docs', href: '/docs/api'},
									{label: 'Resources', href: '/docs/resources'},
								]}
							/>
						</div>
						<br />
						<br />
						<br />
						<div className="pt-6 md:pt-8">
							<AutomationsSection />
						</div>
						<br />
						<br />
						<Demo />
						<br />
						<br />
						<br />
						<BuiltWithRemotionShowcase />
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

'use client';

import React from 'react';
import {ExploreSection} from './ExploreSection';
import CommunityStats from './homepage/CommunityStats';
import {Demo} from './homepage/Demo';
import EvaluateRemotionSection from './homepage/EvaluateRemotion';
import {HomepageHero} from './homepage/HomepageHero';
import type {ColorMode} from './homepage/layout/use-color-mode';
import {ColorModeProvider} from './homepage/layout/use-color-mode';
import {Pricing} from './homepage/Pricing';
import TrustedByBanner from './homepage/TrustedByBanner';
import {BuiltWithRemotionShowcase} from './homepage/VideoAppsShowcase';
import {SectionTitle} from './homepage/VideoAppsTitle';

export const NewLanding: React.FC<{
	readonly colorMode: ColorMode;
	readonly setColorMode: (colorMode: ColorMode) => void;
	readonly experimental: boolean;
}> = ({colorMode, setColorMode, experimental}) => {
	return (
		<ColorModeProvider colorMode={colorMode} setColorMode={setColorMode}>
			<div
				className={`w-full relative ${experimental ? 'experimental-homepage' : ''}`}
			>
				<div style={{overflow: 'hidden'}}>
					<div aria-hidden style={{height: 'calc(2lh - 20px)'}} />
					<div className="max-w-[500px] min-[900px]:max-w-[1000px] m-auto pl-5 pr-5 relative overflow-x-visible [--hero-gap:24px] [--hero-title-overhang:2.9px] sm:[--hero-title-overhang:4.2px] lg:[--hero-title-overhang:7px] [--hero-optical-inset:2.25px] sm:[--hero-optical-inset:3px] lg:[--hero-optical-inset:5px]">
						<HomepageHero colorMode={colorMode} />
						{experimental ? (
							<div className="-mx-5">
								<ExploreSection />
							</div>
						) : (
							<>
								<Demo title={null} description={null} />
								<br />
								<br />
								<br />
								<BuiltWithRemotionShowcase />
								<br />
								<br />
								<br />
							</>
						)}
						<SectionTitle>Pricing</SectionTitle>
						<p className="font-brand mt-0 mb-8 text-center text-lg leading-relaxed [.experimental-homepage_&]:text-left">
							Remotion is completely free to use for any individual or small
							company - no catch.
							<br />
							For bigger companies, we charge a license fee.
						</p>
						<Pricing />
						<div className="flex flex-col gap-10 min-[900px]:grid min-[900px]:grid-cols-[repeat(3,270px)] min-[900px]:justify-between min-[900px]:gap-x-0">
							<TrustedByBanner />
							<EvaluateRemotionSection />
						</div>
						<br />
						<br />
						<br />
						<CommunityStats />
						<br />
						<br />
						<br />
					</div>
				</div>
			</div>
		</ColorModeProvider>
	);
};

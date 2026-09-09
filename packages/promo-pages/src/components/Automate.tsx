'use client';

import React from 'react';
import {AutomateTitle} from './automate/AutomateTitle';
import {BuiltWithRemotionShowcase} from './automate/BuiltWithRemotionShowcase';
import {Demo} from './homepage/Demo';
import EvaluateRemotionSection from './homepage/EvaluateRemotion';
import type {ColorMode} from './homepage/layout/use-color-mode';
import {ColorModeProvider} from './homepage/layout/use-color-mode';
import {MakeVideosAgentically} from './homepage/MakeVideosAgentically';
import {MakeVideosInteractively} from './homepage/MakeVideosInteractively';
import {MakeVideosProgrammatically} from './homepage/MakeVideosProgrammatically';
import {Pricing} from './homepage/Pricing';
import TrustedByBanner from './homepage/TrustedByBanner';
import {SectionTitle} from './homepage/VideoAppsTitle';

export const AutomatePage: React.FC<{
	readonly colorMode: ColorMode;
	readonly setColorMode: (colorMode: ColorMode) => void;
}> = ({colorMode, setColorMode}) => {
	return (
		<ColorModeProvider colorMode={colorMode} setColorMode={setColorMode}>
			<div className="w-full relative overflow-hidden">
				<div className="max-w-[500px] min-[900px]:max-w-[1000px] m-auto px-5 pt-24 pb-16 overflow-x-clip min-[900px]:overflow-x-visible relative">
					<AutomateTitle />
					<div className="mt-12 min-[900px]:mt-16 flex flex-col min-[900px]:flex-row gap-10">
						<MakeVideosProgrammatically
							title="Parameterization"
							description="Organize your assets and connect your data."
							videoSrc="/img/design-systems.webm"
							fallbackVideoSrc="/img/design-systems.mp4"
							links={[
								{
									label: 'Parameterization',
									href: '/docs/parameterized-rendering',
								},
								{label: 'Motion design systems', href: '/design-systems'},
							]}
						/>
						<MakeVideosAgentically
							title="Batch rendering"
							description="Render millions of videos on your own infrastructure."
							links={[
								{
									label: 'Server-side rendering',
									href: '/docs/compare-ssr',
								},
								{
									label: 'Client-side rendering',
									href: '/docs/client-side-rendering',
								},
							]}
						/>
						<MakeVideosInteractively
							title="Applications"
							description="Publish a simple tool or a complex video editor."
							videoSrc="/img/applications.webm"
							fallbackVideoSrc="/img/applications.mp4"
							links={[
								{label: 'Player', href: '/docs/player'},
								{label: 'Editor Starter', href: '/editor-starter'},
							]}
						/>
					</div>
					<Demo
						title="Try it out"
						description="Remotion runs on the web. Videos are data-driven, interactive and can be exported on the client or on the server."
					/>
					<div className="h-16" />
					<BuiltWithRemotionShowcase />
					<div className="h-16" />
					<SectionTitle>Pricing</SectionTitle>
					<p className="mx-auto mb-8 max-w-[840px] text-center text-[15px] font-brand">
						We want everyone to be able to build. Completely free for most, fair
						pricing for companies.
					</p>
					<Pricing />
					<div className="mt-4 min-[900px]:mt-6 flex flex-col min-[900px]:flex-row gap-10">
						<TrustedByBanner />
						<EvaluateRemotionSection />
					</div>
				</div>
			</div>
		</ColorModeProvider>
	);
};

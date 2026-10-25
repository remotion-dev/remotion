'use client';

import React, {useRef} from 'react';
import {ExploreSection} from './ExploreSection';
import {BackgroundAnimation} from './homepage/BackgroundAnimation';
import CommunityStats from './homepage/CommunityStats';
import {Demo} from './homepage/Demo';
import EvaluateRemotionSection from './homepage/EvaluateRemotion';
import {GetStarted} from './homepage/GetStartedStrip';
import type {ColorMode} from './homepage/layout/use-color-mode';
import {ColorModeProvider} from './homepage/layout/use-color-mode';
import {MakeVideosAgentically} from './homepage/MakeVideosAgentically';
import {MakeVideosInteractively} from './homepage/MakeVideosInteractively';
import {MakeVideosProgrammatically} from './homepage/MakeVideosProgrammatically';
import {NewsletterButton} from './homepage/NewsletterButton';
import {Pricing} from './homepage/Pricing';
import {ReactSourceOfTruth} from './homepage/ReactSourceOfTruth';
import type {
	StudioHandoffMode,
	StudioHandoffTitleState,
} from './homepage/studio-handoff/animation';
import {StudioHandoffSectionTitle} from './homepage/StudioHandoffSectionTitle';
import {StudioHandoffCanvas} from './homepage/StudioHandoffCanvas';
import TrustedByBanner from './homepage/TrustedByBanner';
import {BuiltWithRemotionShowcase} from './homepage/VideoAppsShowcase';
import {SectionTitle} from './homepage/VideoAppsTitle';
import {WriteInReact} from './homepage/WriteInReact';

const makeVideosRowClassName =
	'mt-4 min-[900px]:mt-6 flex flex-col gap-10 min-[900px]:grid min-[900px]:grid-cols-[repeat(3,270px)] min-[900px]:justify-between min-[900px]:gap-x-0';

export const NewLanding: React.FC<{
	readonly colorMode: ColorMode;
	readonly setColorMode: (colorMode: ColorMode) => void;
	readonly experimental: boolean;
}> = ({colorMode, setColorMode, experimental}) => {
	const studioHandoffFrameRef = useRef<
		((state: StudioHandoffTitleState) => void) | null
	>(null);
	const studioHandoffLabelsRef = useRef<HTMLDivElement>(null);
	const selectStudioModeRef = useRef<
		((mode: StudioHandoffMode) => void) | null
	>(null);

	return (
		<ColorModeProvider colorMode={colorMode} setColorMode={setColorMode}>
			<div
				className={`w-full relative ${experimental ? 'experimental-homepage' : ''}`}
			>
				<div style={{overflow: 'hidden'}}>
					{experimental ? (
						<div aria-hidden style={{height: 'calc(2lh - 20px)'}} />
					) : (
						<>
							<div>
								<BackgroundAnimation />
							</div>
							<br />
							<br />
							<br />
							<br />
						</>
					)}
					<div
						className={`max-w-[500px] min-[900px]:max-w-[1000px] m-auto pl-5 pr-5 relative [--hero-gap:24px] [--hero-title-overhang:2.9px] sm:[--hero-title-overhang:4.2px] lg:[--hero-title-overhang:7px] [--hero-optical-inset:2.25px] sm:[--hero-optical-inset:3px] lg:[--hero-optical-inset:5px] ${experimental ? 'overflow-x-visible' : 'overflow-x-clip min-[900px]:overflow-x-visible'}`}
					>
						<WriteInReact
							alignWithDevice={experimental}
							onFrameRef={experimental ? studioHandoffFrameRef : null}
							sectionLabelsRef={experimental ? studioHandoffLabelsRef : null}
						/>
						{experimental ? null : (
							<>
								<br />
								<br />
								<br />
							</>
						)}
						{experimental ? (
							<div
								className="relative isolate"
								style={{marginTop: 'var(--hero-gap)'}}
							>
								<div
									aria-hidden
									className="[--hero-gradient-opacity:0.08] min-[900px]:[--hero-gradient-opacity:0.03]"
									style={{
										position: 'absolute',
										bottom: 0,
										left: '50%',
										width: '100vw',
										height: 100,
										transform: 'translateX(-50%)',
										background: `linear-gradient(to top, ${colorMode === 'dark' ? 'rgba(255, 255, 255, var(--hero-gradient-opacity))' : 'rgba(0, 0, 0, var(--hero-gradient-opacity))'}, transparent)`,
										pointerEvents: 'none',
										zIndex: -1,
									}}
								/>
								<StudioHandoffCanvas
									onFrameRef={studioHandoffFrameRef}
									selectModeRef={selectStudioModeRef}
								/>
							</div>
						) : null}
						{experimental ? (
							<div className="mt-2.5 min-[900px]:hidden">
								<GetStarted alignRight command="npx create-video" />
							</div>
						) : null}
						<div
							ref={studioHandoffLabelsRef}
							className={makeVideosRowClassName}
						>
							<MakeVideosAgentically
								title={
									experimental ? (
										<StudioHandoffSectionTitle
											mode="agentically"
											selectModeRef={selectStudioModeRef}
										/>
									) : undefined
								}
								description={
									experimental
										? 'Turn your idea into a video using your agent.'
										: undefined
								}
								showVideo={!experimental}
								videoSrc="/img/homepage-assets-master.webm"
								fallbackVideoSrc="/img/homepage-assets-master.mp4"
							/>
							<MakeVideosInteractively
								videoStyle={null}
								title={
									experimental ? (
										<StudioHandoffSectionTitle
											mode="interactively"
											selectModeRef={selectStudioModeRef}
										/>
									) : undefined
								}
								showVideo={!experimental}
							/>
							<MakeVideosProgrammatically
								title={
									experimental ? (
										<StudioHandoffSectionTitle
											mode="programmatically"
											selectModeRef={selectStudioModeRef}
										/>
									) : undefined
								}
								description={
									experimental
										? 'Own the code, use the web and bring your assets.'
										: undefined
								}
								showVideo={!experimental}
								links={[
									{label: 'API Docs', href: '/docs/api'},
									{label: 'Resources', href: '/docs/resources'},
								]}
							/>
						</div>
						{experimental ? null : <ReactSourceOfTruth />}
						<div className={makeVideosRowClassName}>
							<MakeVideosProgrammatically
								title="Parameterization"
								description="Build templates and connect your data."
								videoSrc={
									'https://remotion.media/homepage/parameterization-centered-row-7f994189e254.webm'
								}
								fallbackVideoSrc={
									'https://remotion.media/homepage/parameterization-centered-row-a171e9b1897d.mp4'
								}
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
								videoSrc={
									'https://remotion.media/homepage/render-progress-inset-padded-c2444f4217c0.webm'
								}
								fallbackVideoSrc={
									'https://remotion.media/homepage/render-progress-inset-padded-25b72a686e9d.mp4'
								}
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
								videoStyle={
									experimental
										? {
												// Display the 840px editor at column width; keep the
												// wider canvas available for the orbiting cursor.
												position: 'absolute',
												top: 0,
												left: `${(-200 / 840) * 100}%`,
												width: `${(1280 / 840) * 100}%`,
												maxWidth: 'none',
												maxHeight: 'none',
												pointerEvents: 'none',
											}
										: null
								}
								description="Make a simple tool or build a complex video editor."
								videoSrc={
									experimental
										? 'https://remotion.media/homepage/applications-map-raised-1ea081adebd3.webm'
										: '/img/applications.webm'
								}
								fallbackVideoSrc={
									experimental
										? 'https://remotion.media/homepage/applications-map-raised-bcb117322f3a.mp4'
										: '/img/applications.mp4'
								}
								links={[
									{label: 'Player', href: '/docs/player'},
									{label: 'Editor Starter', href: '/editor-starter'},
								]}
							/>
						</div>

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
						<div className={makeVideosRowClassName}>
							<TrustedByBanner />
							<EvaluateRemotionSection />
						</div>
						<br />
						<br />
						<br />
						<CommunityStats />
						{experimental ? null : (
							<>
								<br />
								<br />
								<br />
								<br />
								<NewsletterButton />
							</>
						)}
						<br />
						<br />
						<br />
					</div>
				</div>
			</div>
		</ColorModeProvider>
	);
};

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
	const studioHandoffFrameRef = useRef<((time: number) => void) | null>(null);

	return (
		<ColorModeProvider colorMode={colorMode} setColorMode={setColorMode}>
			<div className="w-full relative">
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
									style={{
										position: 'absolute',
										bottom: 0,
										left: '50%',
										width: '100vw',
										height: 100,
										transform: 'translateX(-50%)',
										background: `linear-gradient(to top, ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'}, transparent)`,
										pointerEvents: 'none',
										zIndex: -1,
									}}
								/>
								<StudioHandoffCanvas onFrameRef={studioHandoffFrameRef} />
							</div>
						) : null}
						{experimental ? (
							<div className="mt-2.5 min-[900px]:hidden">
								<GetStarted alignRight command="npx create-video" />
							</div>
						) : null}
						<div className={makeVideosRowClassName}>
							<MakeVideosAgentically
								showVideo={!experimental}
								videoSrc="/img/homepage-assets-master.webm"
								fallbackVideoSrc="/img/homepage-assets-master.mp4"
							/>
							<MakeVideosInteractively showVideo={!experimental} />
							<MakeVideosProgrammatically
								showVideo={!experimental}
								links={[
									{label: 'API Docs', href: '/docs/api'},
									{label: 'Resources', href: '/docs/resources'},
								]}
							/>
						</div>
						<ReactSourceOfTruth />
						<div className={makeVideosRowClassName}>
							<MakeVideosProgrammatically
								title="Parameterization"
								description="Organize your assets and connect your data."
								videoSrc={
									experimental
										? 'https://remotion.media/homepage/design-systems-outline-b86199f394b9.webm'
										: '/img/design-systems.webm'
								}
								fallbackVideoSrc={
									experimental
										? 'https://remotion.media/homepage/design-systems-outline-b86199f394b9.mp4'
										: '/img/design-systems.mp4'
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
								videoSrc="https://remotion.media/homepage/render-progress-bottom-aligned-a27b53fb8766.webm"
								fallbackVideoSrc="https://remotion.media/homepage/render-progress-bottom-aligned-a27b53fb8766.mp4"
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
								videoSrc={
									experimental
										? 'https://remotion.media/homepage/applications-outline-input-e966e757a1ae.webm'
										: '/img/applications.webm'
								}
								fallbackVideoSrc={
									experimental
										? 'https://remotion.media/homepage/applications-outline-input-e966e757a1ae.mp4'
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
						<p className="font-brand mt-0 mb-8 text-center text-lg leading-relaxed">
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

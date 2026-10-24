'use client';

import React, {useRef, useState} from 'react';
import {ExploreSection} from './ExploreSection';
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
import {ReactSourceOfTruth} from './homepage/ReactSourceOfTruth';
import TrustedByBanner from './homepage/TrustedByBanner';
import {useTransparentVideoSource} from './homepage/use-transparent-video-source';
import {BuiltWithRemotionShowcase} from './homepage/VideoAppsShowcase';
import {SectionTitle} from './homepage/VideoAppsTitle';
import {WriteInReact} from './homepage/WriteInReact';

const makeVideosRowClassName =
	'mt-4 min-[900px]:mt-6 flex flex-col min-[900px]:flex-row gap-10';

export const NewLanding: React.FC<{
	readonly colorMode: ColorMode;
	readonly setColorMode: (colorMode: ColorMode) => void;
	readonly experimental: boolean;
}> = ({colorMode, setColorMode, experimental}) => {
	const studioHandoffVideoRef = useRef<HTMLVideoElement>(null);
	const [studioHandoffReady, setStudioHandoffReady] = useState(false);
	const studioHandoffSrc = useTransparentVideoSource({
		videoSrc:
			'https://remotion.media/homepage/studio-handoff-continuous-waveform-bf3fb054d840.webm',
		fallbackVideoSrc:
			'https://remotion.media/homepage/studio-handoff-continuous-waveform-bf3fb054d840.mp4',
	});

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
							videoRef={experimental ? studioHandoffVideoRef : null}
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
								{studioHandoffReady ? null : (
									<div
										aria-hidden
										className="absolute inset-0 overflow-hidden pointer-events-none"
									>
										<div
											style={{
												width: '100%',
												aspectRatio: '1874 / 1075',
												backgroundColor: '#101114',
												borderRadius: '2.16% / 3.77%',
											}}
										/>
									</div>
								)}
								<video
									ref={studioHandoffVideoRef}
									src={studioHandoffSrc ?? undefined}
									onLoadedData={() => setStudioHandoffReady(true)}
									onEmptied={() => setStudioHandoffReady(false)}
									autoPlay
									muted
									loop
									playsInline
									preload="metadata"
									width={1874}
									height={1020}
									aria-label="Remotion Studio, Codex and VS Code working together"
									className="block aspect-[1874/1020] h-auto w-full"
									style={{opacity: studioHandoffReady ? 1 : 0}}
								/>
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
										? 'https://remotion.media/homepage/design-systems-border-9871af1c4d7f.webm'
										: '/img/design-systems.webm'
								}
								fallbackVideoSrc={
									experimental
										? 'https://remotion.media/homepage/design-systems-border-9871af1c4d7f.mp4'
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
								videoSrc={
									experimental
										? 'https://remotion.media/homepage/render-progress-flush-e9ec7d39c5f8.webm'
										: '/img/render-progress.webm'
								}
								fallbackVideoSrc={
									experimental
										? 'https://remotion.media/homepage/render-progress-flush-e9ec7d39c5f8.mp4'
										: '/img/render-progress.mp4'
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

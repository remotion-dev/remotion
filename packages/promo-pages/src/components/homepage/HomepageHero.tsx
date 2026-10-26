import React, {useRef} from 'react';
import {GetStarted} from './GetStartedStrip';
import type {ColorMode} from './layout/use-color-mode';
import {MakeVideosAgentically} from './MakeVideosAgentically';
import {MakeVideosInteractively} from './MakeVideosInteractively';
import {MakeVideosProgrammatically} from './MakeVideosProgrammatically';
import type {
	StudioHandoffMode,
	StudioHandoffTitleState,
} from './studio-handoff/animation';
import {StudioHandoffCanvas} from './StudioHandoffCanvas';
import {StudioHandoffSectionTitle} from './StudioHandoffSectionTitle';
import {SectionTitle} from './VideoAppsTitle';
import {WriteInReact} from './WriteInReact';

const makeVideosRowClassName =
	'flex flex-col gap-10 min-[900px]:grid min-[900px]:grid-cols-[repeat(3,270px)] min-[900px]:justify-between min-[900px]:gap-x-0';

export const HomepageHero: React.FC<{readonly colorMode: ColorMode}> = ({
	colorMode,
}) => {
	const studioHandoffFrameRef = useRef<
		((state: StudioHandoffTitleState) => void) | null
	>(null);
	const studioHandoffLabelsRef = useRef<HTMLDivElement>(null);
	const selectStudioModeRef = useRef<
		((mode: StudioHandoffMode) => void) | null
	>(null);

	return (
		<>
			<WriteInReact
				onFrameRef={studioHandoffFrameRef}
				sectionLabelsRef={studioHandoffLabelsRef}
			/>
			<div className="relative isolate" style={{marginTop: 'var(--hero-gap)'}}>
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
			<div className="mt-2.5 min-[900px]:hidden">
				<GetStarted command="npx create-video" />
			</div>
			<div
				ref={studioHandoffLabelsRef}
				className={`mt-12 min-[900px]:mt-6 ${makeVideosRowClassName}`}
			>
				<MakeVideosAgentically
					title={
						<StudioHandoffSectionTitle
							mode="agentically"
							selectModeRef={selectStudioModeRef}
						/>
					}
					description="Turn your idea into a video using your agent."
					showVideo={false}
				/>
				<MakeVideosInteractively
					videoStyle={null}
					title={
						<StudioHandoffSectionTitle
							mode="interactively"
							selectModeRef={selectStudioModeRef}
						/>
					}
					showVideo={false}
				/>
				<MakeVideosProgrammatically
					title={
						<StudioHandoffSectionTitle
							mode="programmatically"
							selectModeRef={selectStudioModeRef}
						/>
					}
					description="Leverage web technology and own your video as code."
					showVideo={false}
					links={[
						{label: 'API Docs', href: '/docs/api'},
						{label: 'Resources', href: '/docs/resources'},
					]}
				/>
			</div>
			<div className="pt-24 [&_h2]:mb-0 [&_h2]:text-left">
				<SectionTitle>Automate video production</SectionTitle>
			</div>
			<div className={`mt-2 min-[900px]:mt-4 ${makeVideosRowClassName}`}>
				<MakeVideosProgrammatically
					title="Parameterization"
					description="Build templates and connect your assets."
					videoSrc="https://remotion.media/homepage/parameterization-brand-4b037d1643f4.webm"
					fallbackVideoSrc="https://remotion.media/homepage/parameterization-brand-97e28abb2c0b.mp4"
					links={[
						{label: 'Parameterization', href: '/docs/parameterized-rendering'},
						{label: 'Motion design systems', href: '/design-systems'},
					]}
				/>
				<MakeVideosAgentically
					title="Batch rendering"
					description="Render millions of videos on your own infrastructure."
					videoSrc="https://remotion.media/homepage/render-progress-inset-padded-c2444f4217c0.webm"
					fallbackVideoSrc="https://remotion.media/homepage/render-progress-inset-padded-25b72a686e9d.mp4"
					links={[
						{label: 'Server-side rendering', href: '/docs/compare-ssr'},
						{
							label: 'Client-side rendering',
							href: '/docs/client-side-rendering',
						},
					]}
				/>
				<MakeVideosInteractively
					title="Applications"
					videoStyle={{
						// Display the 840px editor at column width; keep the
						// wider canvas available for the orbiting cursor.
						position: 'absolute',
						top: 0,
						left: `${(-200 / 840) * 100}%`,
						width: `${(1280 / 840) * 100}%`,
						maxWidth: 'none',
						maxHeight: 'none',
						pointerEvents: 'none',
					}}
					description="Make a simple tool or build a complex video editor."
					videoSrc="https://remotion.media/homepage/applications-map-raised-1ea081adebd3.webm"
					fallbackVideoSrc="https://remotion.media/homepage/applications-map-raised-bcb117322f3a.mp4"
					links={[
						{label: 'Player', href: '/docs/player'},
						{label: 'Editor Starter', href: '/editor-starter'},
					]}
				/>
			</div>
		</>
	);
};

'use client';

import React, {useEffect, useState} from 'react';
import {ExploreVideo} from './ExploreVideo';
import {SectionTitle} from './homepage/VideoAppsTitle';

const videoSources: Record<string, string> = {
	Studio: 'studio-tools-stop-2026-10-28-ef0a4cfe30bd.mp4',
	Video: 'video-playback-color-2026-10-28-3af80f6017fd.mp4',
	Audio: 'audio-color-2026-10-28-dd40ae1451f1.mp4',
	Captions: 'captions-color-2026-10-28-48f3a3fe7e7c.mp4',
	Agents: 'agents-color-2026-10-28-f8fbd7dfd8de.mp4',
	Parameterization: 'parameterization-blue-2026-10-20-6278779b9cd1.mp4',
	Rendering: 'rendering-color-2026-10-28-f1356e69332c.mp4',
	Effects: 'effects-2026-10-20-869defbc5f69.mp4',
	Elements: 'elements-2026-10-27-101007603fb7.mp4',
	Transitions: 'transitions-2026-10-20-b49c7dfb4fe1.mp4',
	'Color Correction': 'color-correction-curves-2026-10-27-6649bbff497b.mp4',
	Keyframes: 'keyframes-2026-10-27-f0ba2e20abc2.mp4',
	'Background removal': 'background-removal-color-2026-10-28-ff09da4c9bdd.mp4',
	Player: 'player-zoom-radial-blur-2026-10-27-83c6f9216476.mp4',
	'Editor Starter': 'editor-starter-no-vignette-2026-10-27-ec6b5ef939c3.mp4',
	'Canvas Capture': 'canvas-capture-2026-10-27-253104dab7ca.mp4',
	'remotion.dev/convert': 'convert-reframed-2026-10-28-e8cc8418704e.mp4',
	'remotion.media': 'media-default-2026-10-28-98858a945958.mp4',
};

export const ExploreSection: React.FC = () => {
	const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);
	const [focusedTitle, setFocusedTitle] = useState<string | null>(null);
	const [pageVisible, setPageVisible] = useState(true);

	useEffect(() => {
		const updateVisibility = () => setPageVisible(!document.hidden);
		updateVisibility();
		document.addEventListener('visibilitychange', updateVisibility);
		return () =>
			document.removeEventListener('visibilitychange', updateVisibility);
	}, []);

	return (
		<section className="mx-auto max-w-[1000px] px-5 pt-24 pb-24 [&_h2]:mb-10">
			<SectionTitle>Explore the world of Remotion</SectionTitle>
			<div className="grid grid-cols-2 gap-x-4 gap-y-10 min-[700px]:grid-cols-3 min-[700px]:gap-x-6 min-[900px]:grid-cols-4 min-[900px]:gap-y-12">
				{[
					{
						title: 'Studio',
						href: '/docs/studio',
						description: 'Preview, edit and render your videos',
					},
					{
						title: 'Video',
						href: '/docs/videos',
						description: 'Frame-accurate and vast format support',
					},
					{
						title: 'Audio',
						href: '/docs/using-audio',
						description: 'Precise control over volume, pitch and visualization',
					},
					{
						title: 'Captions',
						href: '/docs/captions',
						description: 'Transcription, display, editing, import and export',
					},
					{
						title: 'Agents',
						href: '/docs/ai',
						description: 'Skills, Agent Plugins and WebMCP integration',
					},
					{
						title: 'Parameterization',
						href: '/docs/parameterized-rendering',
						description:
							'Visual and programmatic ways to hook up data to your video',
					},
					{
						title: 'Rendering',
						href: '/docs/render',
						description: 'Fast, everywhere and with tons of options',
					},
					{
						title: 'Effects',
						href: '/docs/effects',
						description: '80 presets that apply to any Element, make your own',
					},
					{
						title: 'Transitions',
						href: '/docs/transitioning',
						description: '20 presets and fully customizable',
					},
					{
						title: 'Elements',
						href: '/elements',
						description: 'Building blocks from Remotion and third parties',
					},
					{
						title: 'Color Correction',
						href: '/docs/color-correction',
						description: 'Exposure, contrast, levels, curves and LUTs',
					},
					{
						title: 'Keyframes',
						href: '/docs/studio/interactivity#keyframes',
						description: 'Interactively editable and saves back to code',
					},
					{
						title: 'Background removal',
						href: '/docs/video-matting',
						description: 'Separate layers fully locally using WebGPU',
					},
					{
						title: 'Player',
						href: '/docs/player',
						description: 'Embed a live Remotion video into your app',
					},
					{
						title: 'Editor Starter',
						href: '/docs/editor-starter',
						description: 'Template for building a non-linear video editor',
					},
					{
						title: 'Canvas Capture',
						href: '/docs/canvas-capture',
						description: 'A screen recorder for micro-interactions',
					},
					{
						title: 'remotion.dev/convert',
						href: 'https://remotion.dev/convert',
						description: 'Free, fast and offline video converter',
					},
					{
						title: 'remotion.dev/new',
						href: 'https://remotion.dev/new',
						description: 'Try out the Remotion Studio without installation',
					},
					{
						title: 'remotion.media',
						href: 'https://remotion.media',
						description: 'Free media files on a CDN for testing purposes',
					},
					{
						title: 'SDK',
						href: '/docs/sdk',
						description: 'Agentic video creation in your own app',
					},
				].map(({title, href, description}) => (
					<a
						key={title}
						href={href}
						onPointerEnter={(event) => {
							if (event.pointerType !== 'touch') setHoveredTitle(title);
						}}
						onPointerLeave={() => setHoveredTitle(null)}
						onFocus={() => setFocusedTitle(title)}
						onBlur={() => setFocusedTitle(null)}
						className="group/explore-card flex min-w-0 flex-col gap-3 rounded-lg text-inherit no-underline hover:text-inherit hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
					>
						<div className="explore-tile relative aspect-square overflow-hidden rounded-lg">
							{videoSources[title] ? (
								<ExploreVideo
									key={videoSources[title]}
									src={`https://remotion.media/explore-remotion/${videoSources[title]}`}
									active={
										pageVisible && (hoveredTitle ?? focusedTitle) === title
									}
								/>
							) : null}
						</div>
						<div className="flex flex-col gap-2">
							<h3
								className={`m-0 fontbrand text-lg leading-[1.1] font-medium min-[900px]:text-[22px] ${title === 'SDK' || title === 'Editor Starter' || title === 'Canvas Capture' ? 'flex items-center gap-2' : ''}`}
							>
								{title}
								{title === 'SDK' ||
								title === 'Editor Starter' ||
								title === 'Canvas Capture' ? (
									<span className="shrink-0 rounded border border-solid border-current px-1.5 py-0.5 text-xs leading-none font-normal text-muted">
										{title === 'Editor Starter' ? 'Paid' : 'Soon'}
									</span>
								) : null}
							</h3>
							{description ? (
								<p className="m-0 fontbrand text-base leading-normal text-muted transition-colors duration-150 ease-out group-hover/explore-card:text-[var(--text-color)]">
									{description}
								</p>
							) : null}
						</div>
					</a>
				))}
			</div>
		</section>
	);
};

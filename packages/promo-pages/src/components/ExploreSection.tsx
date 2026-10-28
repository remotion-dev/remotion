'use client';

import React, {useEffect, useState} from 'react';
import {ExploreVideo} from './ExploreVideo';
import {SectionTitle} from './homepage/VideoAppsTitle';

const videoSources: Record<string, string> = {
	Studio: 'studio-cursor-safe-2026-10-28-12eceb67ac7f.mp4',
	Video: 'uniform-angle-video-2026-10-28-63170f325244.mp4',
	Audio: 'uniform-angle-audio-2026-10-28-4e6a75985653.mp4',
	Captions: 'captions-trimmed-2026-10-28-601831ff274e.mp4',
	Agents: 'agents-reframed-2026-10-28-05352d1ae978.mp4',
	Parameterization: 'parameterization-reframed-2026-10-28-5aef41497ae7.mp4',
	Rendering: 'rendering-natural-2026-10-28-b0466660e7fb.mp4',
	Effects: 'effects-reframed-2026-10-28-bfe8242ea926.mp4',
	Elements: 'uniform-angle-elements-2026-10-28-509d1ab4985d.mp4',
	Transitions: 'uniform-angle-transitions-2026-10-28-72f5b63b8c9b.mp4',
	'Color Correction': 'color-correction-reframed-2026-10-28-bbd0c2bcacf6.mp4',
	Keyframes: 'uniform-angle-keyframes-2026-10-28-fd7bcfd66bcf.mp4',
	'Background removal':
		'uniform-angle-background-removal-2026-10-28-621c765dd39d.mp4',
	Player: 'player-close-2026-10-28-b1906ac6b286.mp4',
	'Editor Starter': 'editor-starter-no-vignette-2026-10-27-ec6b5ef939c3.mp4',
	'Canvas Capture': 'canvas-capture-2026-10-27-253104dab7ca.mp4',
	'remotion.dev/convert': 'convert-reframed-2026-10-28-e8cc8418704e.mp4',
	'remotion.new': 'new-actions-downward-2026-10-28-30c0c623c208.mp4',
	'remotion.media': 'media-default-2026-10-28-98858a945958.mp4',
};

const imageSources: Record<string, string> = {
	SDK: 'https://remotion.media/explore-remotion/sdk-code-centered-2026-10-28-3f656f8f25f7.png',
};

export const ExploreSection: React.FC = () => {
	const [hoveredTitle, setHoveredTitle] = useState<string | null>(null);
	const [focusedTitle, setFocusedTitle] = useState<string | null>(null);
	const [tappedTitle, setTappedTitle] = useState<string | null>(null);
	const [touchDevice, setTouchDevice] = useState<boolean | null>(null);
	const [pageVisible, setPageVisible] = useState(true);

	useEffect(() => {
		const touchInput = window.matchMedia('(hover: none), (pointer: coarse)');
		const updateInput = () => {
			setTouchDevice(touchInput.matches);
			setTappedTitle(null);
			setHoveredTitle(null);
			setFocusedTitle(null);
		};

		updateInput();
		touchInput.addEventListener('change', updateInput);
		return () => touchInput.removeEventListener('change', updateInput);
	}, []);

	useEffect(() => {
		const updateVisibility = () => setPageVisible(!document.hidden);
		updateVisibility();
		document.addEventListener('visibilitychange', updateVisibility);
		return () =>
			document.removeEventListener('visibilitychange', updateVisibility);
	}, []);

	return (
		<section className="mx-auto max-w-[1000px] px-5 pt-24 pb-24 [&_h2]:mb-10">
			<SectionTitle>What makes Remotion good?</SectionTitle>
			<div className="grid grid-cols-2 gap-x-4 gap-y-10 min-[900px]:grid-cols-4 min-[900px]:gap-x-6 min-[900px]:gap-y-12">
				{[
					{
						title: 'Studio',
						href: '/docs/studio',
						description: 'Preview, edit and render your videos',
					},
					{
						title: 'Parameterization',
						href: '/docs/parameterized-rendering',
						description: 'Connect data to your video',
					},
					{
						title: 'Player',
						href: '/docs/player',
						description: 'Embed a live Remotion video into your app',
					},
					{
						title: 'Rendering',
						href: '/docs/render',
						description: 'Fast, everywhere and with tons of options',
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
						description: 'Separate layers locally using WebGPU',
					},
					{
						title: 'Agents',
						href: '/docs/ai',
						description: 'Skills, Agent Plugins and WebMCP integration',
					},
					{
						title: 'SDK',
						href: '/docs/sdk',
						description: 'Agentic video creation in your own app',
					},
					{
						title: 'remotion.new',
						href: 'https://remotion.new',
						description: 'Try out the Remotion Studio without installation',
					},
					{
						title: 'Editor Starter',
						href: '/docs/editor-starter',
						description: 'Template for building a non-linear video editor',
					},
					{
						title: 'remotion.dev/convert',
						href: 'https://remotion.dev/convert',
						description: 'Free, fast and offline video converter',
					},
					{
						title: 'remotion.media',
						href: 'https://remotion.media',
						description: 'Free media files on a CDN for testing purposes',
					},
					{
						title: 'Canvas Capture',
						href: '/docs/canvas-capture',
						description: 'A screen recorder for micro-interactions',
					},
				].map(({title, href, description}) => {
					const videoSource = videoSources[title];
					const hasVideo = Boolean(videoSource);
					const imageSource = imageSources[title];
					const hasPreview = hasVideo || Boolean(imageSource);
					const Card = touchDevice ? 'div' : 'a';
					const Preview = touchDevice && hasPreview ? 'button' : 'div';
					const Description = touchDevice ? 'a' : 'div';
					const active =
						pageVisible &&
						(touchDevice ? tappedTitle : (hoveredTitle ?? focusedTitle)) ===
							title;

					return (
						<Card
							key={title}
							href={touchDevice ? undefined : href}
							data-active={active}
							onPointerEnter={(event) => {
								if (!touchDevice && event.pointerType === 'mouse') {
									setHoveredTitle(title);
								}
							}}
							onPointerLeave={() => setHoveredTitle(null)}
							onFocus={() => {
								if (!touchDevice) setFocusedTitle(title);
							}}
							onBlur={() => setFocusedTitle(null)}
							className={`group/explore-card flex min-w-0 appearance-none flex-col gap-3 rounded-lg border-0 bg-transparent p-0 text-left fontbrand text-inherit no-underline hover:text-inherit hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${!touchDevice ? 'cursor-pointer' : ''}`}
						>
							<Preview
								type={touchDevice && hasPreview ? 'button' : undefined}
								aria-label={
									touchDevice && hasPreview
										? `${tappedTitle === title ? 'Pause' : 'Play'} ${title} preview`
										: undefined
								}
								aria-pressed={
									touchDevice && hasPreview ? tappedTitle === title : undefined
								}
								onClick={
									touchDevice && hasPreview
										? () =>
												setTappedTitle((current) =>
													current === title ? null : title,
												)
										: undefined
								}
								className={`explore-tile relative block aspect-square w-full appearance-none overflow-hidden rounded-lg border-0 p-0 text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current ${touchDevice && hasPreview ? 'cursor-pointer' : ''}`}
							>
								{hasVideo && touchDevice !== null ? (
									<ExploreVideo
										key={videoSource}
										src={`https://remotion.media/explore-remotion/${videoSource}`}
										active={active}
										fadeOnLeave={!touchDevice && pageVisible}
									/>
								) : imageSource ? (
									<>
										<img
											src={imageSource}
											alt=""
											aria-hidden="true"
											decoding="async"
											className={`pointer-events-none absolute inset-0 h-full w-full scale-[1.01] object-cover transition-[filter] duration-150 ease-out motion-reduce:transition-none ${active ? 'grayscale-0' : 'grayscale'}`}
										/>
										<div
											className="explore-image-motion absolute inset-0"
											data-active={active}
										>
											<img
												src={imageSource}
												alt=""
												aria-hidden="true"
												decoding="async"
												className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-[filter] duration-150 ease-out motion-reduce:transition-none ${active ? 'grayscale-0' : 'grayscale'}`}
											/>
										</div>
									</>
								) : null}
							</Preview>
							<Description
								href={touchDevice ? href : undefined}
								className="flex flex-col gap-2 rounded-sm text-inherit no-underline hover:text-inherit hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
							>
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
									<p className="m-0 fontbrand text-base leading-normal text-muted transition-colors duration-150 ease-out group-data-[active=true]/explore-card:text-[var(--text-color)]">
										{description}
									</p>
								) : null}
							</Description>
						</Card>
					);
				})}
			</div>
		</section>
	);
};

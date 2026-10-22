import type {Caption, TikTokPage} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	spring,
	type InteractivitySchema,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const CAPTIONS_DURATION_IN_FRAMES = 1628;
export const CAPTIONS_HEIGHT = 360;

const SWITCH_CAPTIONS_EVERY_MS = 1100;
const HIGHLIGHT_COLOR = '#6cf6ff';

const animatedCaptionsSchema = {
	...Interactive.captionsSchema,
	width: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Caption area width',
		hiddenFromList: false,
	},
	height: {
		type: 'number',
		min: 1,
		step: 1,
		default: undefined,
		description: 'Caption area height',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const CaptionPageInner: React.FC<{page: TikTokPage}> = ({page}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const absoluteTimeMs = page.startMs + (frame / fps) * 1000;
	const enter = spring({
		frame,
		fps,
		config: {damping: 14, mass: 0.55, stiffness: 180},
	});
	const exit = interpolate(
		frame,
		[
			Math.max(0, (page.durationMs / 1000) * fps - 5),
			(page.durationMs / 1000) * fps,
		],
		[1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);

	return (
		<AbsoluteFill
			showInTimeline={false}
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				padding: '42px 64px 48px',
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					opacity: exit,
					transform: `translateY(${interpolate(enter, [0, 1], [50, 0])}px) scale(${interpolate(enter, [0, 1], [0.82, 1])})`,
					transformOrigin: 'center bottom',
					textAlign: 'center',
					fontFamily: 'Arial Black, Arial, sans-serif',
					fontSize: 76,
					fontWeight: 900,
					letterSpacing: -3.5,
					lineHeight: 1.05,
					textWrap: 'balance',
					whiteSpace: 'pre-wrap',
					filter:
						'drop-shadow(0 8px 0 rgba(0, 0, 0, 0.82)) drop-shadow(0 16px 24px rgba(0, 0, 0, 0.55))',
				}}
			>
				{page.tokens.map((token, tokenIndex) => {
					const isActive =
						token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
					return (
						<span
							key={`${token.fromMs}-${tokenIndex}`}
							style={{
								color: isActive ? HIGHLIGHT_COLOR : '#ffffff',
								display: 'inline-block',
								marginLeft: tokenIndex === 0 ? 0 : 26,
								WebkitTextStroke: isActive
									? '3px rgba(0, 20, 28, 0.95)'
									: '2px rgba(0, 0, 0, 0.85)',
							}}
						>
							{token.text.trimStart()}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

const CaptionPage = Interactive.withSchema({
	Component: CaptionPageInner,
	componentName: 'CaptionPage',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

type AnimatedCaptionsProps = {
	readonly captions: Caption[];
};

const AnimatedCaptionsInner: React.FC<AnimatedCaptionsProps> = ({captions}) => {
	const {fps} = useVideoConfig();
	const pages = useMemo(() => {
		return createTikTokStyleCaptions({
			captions,
			combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
		}).pages;
	}, [captions]);

	return (
		<>
			{pages.map((page, index) => {
				const nextPage = pages[index + 1];
				const startFrame = Math.round((page.startMs / 1000) * fps);
				const naturalEndFrame = Math.ceil(
					((page.startMs + page.durationMs) / 1000) * fps,
				);
				const endFrame = nextPage
					? Math.min(
							Math.round((nextPage.startMs / 1000) * fps),
							naturalEndFrame,
						)
					: naturalEndFrame;
				const durationInFrames = Math.max(1, endFrame - startFrame);

				return (
					<CaptionPage
						key={`${page.startMs}-${index}`}
						from={startFrame}
						durationInFrames={durationInFrames}
						premountFor={fps}
						showInTimeline={false}
						page={page}
					/>
				);
			})}
		</>
	);
};

export const AnimatedCaptions = Interactive.withSchema({
	Component: AnimatedCaptionsInner,
	componentName: 'AnimatedCaptions',
	schema: animatedCaptionsSchema,
	wrapInSequence: true,
	layout: 'absolute-fill',
});

import type {Caption, TikTokPage} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {watchStaticFile} from '@remotion/studio';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
	AbsoluteFill,
	Interactive,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useDelayRender,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';

export const CAPTIONS_DURATION_IN_FRAMES = 1628;
export const CAPTIONS_HEIGHT = 360;

const SWITCH_CAPTIONS_EVERY_MS = 1100;
const HIGHLIGHT_COLOR = '#6cf6ff';

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
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

const AnimatedCaptionsInner: React.FC<{readonly src: string}> = ({src}) => {
	const [captions, setCaptions] = useState<Caption[] | null>(null);
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Loading ElevenLabs captions'));
	const {fps} = useVideoConfig();
	const {isStudio} = useRemotionEnvironment();

	const loadCaptions = useCallback(
		async (source: string) => {
			try {
				const response = await fetch(source);
				if (!response.ok) {
					throw new Error(`Could not load captions (${response.status})`);
				}

				setCaptions((await response.json()) as Caption[]);
				continueRender(handle);
			} catch (error) {
				cancelRender(error);
			}
		},
		[cancelRender, continueRender, handle],
	);

	useEffect(() => {
		loadCaptions(src);

		if (!isStudio) {
			return;
		}

		const {cancel} = watchStaticFile(src, (newFile) => {
			if (newFile) {
				loadCaptions(`${newFile.src}?date=${newFile.lastModified}`);
			}
		});

		return cancel;
	}, [isStudio, loadCaptions, src]);

	const pages = useMemo(() => {
		if (!captions) {
			return [];
		}

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
					<Sequence
						key={`${page.startMs}-${index}`}
						from={startFrame}
						durationInFrames={durationInFrames}
						premountFor={fps}
						showInTimeline={false}
					>
						<CaptionPage page={page} />
					</Sequence>
				);
			})}
		</>
	);
};

export const AnimatedCaptions = Interactive.withCaptions({
	Component: AnimatedCaptionsInner,
	componentName: 'AnimatedCaptions',
});

export const AnimatedCaptionsComposition: React.FC = () => {
	return <AnimatedCaptions src={staticFile('voiceover-captions.json')} />;
};

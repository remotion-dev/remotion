import type {Caption, TikTokPage} from '@remotion/captions';
import {Audio} from '@remotion/media';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';
import {asset} from './assets';
import {createSentenceAwareCaptionPages} from './paginate-captions';

export const BIG_WORD_CAPTIONS_DURATION_IN_FRAMES = 1816;

const VOICEOVER_FILE = 'text-behind-video-2.wav';
const CAPTIONS_FILE = 'voiceover-captions.json';
const FONT_FAMILY = 'Arial Black, Arial, sans-serif';
const SWITCH_CAPTIONS_EVERY_MS = 1100;
const HIGHLIGHT_COLOR = '#ff3b1f';

const BigWordPage: React.FC<{page: TikTokPage}> = ({page}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const absoluteTimeMs = page.startMs + (frame / fps) * 1000;
	const longestWordLength = Math.max(
		...page.tokens.map((token) => token.text.trim().length),
		1,
	);
	const fontSize = Math.min(230, 920 / Math.max(longestWordLength * 0.72, 1));

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				padding: 64,
				pointerEvents: 'none',
			}}
		>
			<Interactive.Div
				name={`Caption page: ${page.text.trim()}`}
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					fontFamily: FONT_FAMILY,
					fontWeight: 900,
					justifyContent: 'center',
					width: '100%',
					textTransform: 'uppercase',
				}}
			>
				{page.tokens.map((token, tokenIndex) => {
					const word = token.text.trim();
					const isActive =
						token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
					const wordStartFrame = Math.round(
						((token.fromMs - page.startMs) / 1000) * fps,
					);

					return (
						<div
							key={`${token.fromMs}-${tokenIndex}`}
							style={{
								color: isActive ? HIGHLIGHT_COLOR : '#ffffff',
								filter:
									'drop-shadow(0 14px 0 rgba(0, 0, 0, 0.96)) drop-shadow(0 30px 34px rgba(0, 0, 0, 0.5))',
								fontSize,
								letterSpacing: -0.055 * fontSize,
								lineHeight: 0.86,
								maxWidth: 952,
								opacity: interpolate(
									frame,
									[wordStartFrame, wordStartFrame + 1],
									[0, 1],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								scale: interpolate(
									frame,
									[wordStartFrame, wordStartFrame + 10],
									[0.2, 1],
									{
										easing: Easing.spring({
											damping: 11,
											mass: 0.65,
											stiffness: 210,
										}),
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
									},
								),
								textAlign: 'center',
								transformOrigin: 'center center',
								WebkitTextStroke: `${Math.max(3, fontSize * 0.018)}px black`,
								whiteSpace: 'nowrap',
							}}
						>
							{word}
						</div>
					);
				})}
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const AnimatedCaptionsBigWords: React.FC = () => {
	const [captions, setCaptions] = useState<Caption[] | null>(null);
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Loading big word captions'));
	const {fps} = useVideoConfig();

	const loadCaptions = useCallback(async () => {
		try {
			const response = await fetch(asset(CAPTIONS_FILE));
			if (!response.ok) {
				throw new Error(`Could not load captions (${response.status})`);
			}

			setCaptions((await response.json()) as Caption[]);
			continueRender(handle);
		} catch (error) {
			cancelRender(error);
		}
	}, [cancelRender, continueRender, handle]);

	useEffect(() => {
		loadCaptions();
	}, [loadCaptions]);

	const pages = useMemo(() => {
		if (!captions) {
			return [];
		}

		return createSentenceAwareCaptionPages({
			captions,
			combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
		});
	}, [captions]);

	if (!captions) {
		return null;
	}

	return (
		<AbsoluteFill>
			<Audio src={asset(VOICEOVER_FILE)} hidden showInTimeline={false} />
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
						name={`Caption page: ${page.text.trim()}`}
						from={startFrame}
						durationInFrames={durationInFrames}
						premountFor={fps}
						showInTimeline={false}
					>
						<BigWordPage page={page} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

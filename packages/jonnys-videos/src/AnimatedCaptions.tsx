import type {Caption, TikTokPage} from '@remotion/captions';
import {Audio} from '@remotion/media';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
	AbsoluteFill,
	Sequence,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
} from 'remotion';
import {asset} from './assets';
import {createSentenceAwareCaptionPages} from './paginate-captions';

export const VOICEOVER_FILE = 'text-behind-video-2.wav';
export const CAPTIONS_FILE = 'voiceover-captions.json';
export const CAPTIONS_DURATION_IN_FRAMES = 1816;
export const CAPTIONS_HEIGHT = 360;

type AnimatedCaptionsProps = {
	captionsFile?: string;
	voiceoverFile?: string | null;
};

const SWITCH_CAPTIONS_EVERY_MS = 1100;
const HIGHLIGHT_COLOR = '#ff3b1f';

const CaptionPage: React.FC<{page: TikTokPage}> = ({page}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const absoluteTimeMs = page.startMs + (frame / fps) * 1000;

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
									? '3px rgba(38, 4, 0, 0.95)'
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

export const AnimatedCaptions: React.FC<AnimatedCaptionsProps> = ({
	captionsFile = CAPTIONS_FILE,
	voiceoverFile = VOICEOVER_FILE,
}) => {
	const [captions, setCaptions] = useState<Caption[] | null>(null);
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Loading ElevenLabs captions'));
	const {fps} = useVideoConfig();

	const loadCaptions = useCallback(async () => {
		try {
			const response = await fetch(asset(captionsFile));
			if (!response.ok) {
				throw new Error(`Could not load captions (${response.status})`);
			}

			setCaptions((await response.json()) as Caption[]);
			continueRender(handle);
		} catch (error) {
			cancelRender(error);
		}
	}, [cancelRender, captionsFile, continueRender, handle]);

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
			{voiceoverFile ? (
				<Audio src={asset(voiceoverFile)} hidden showInTimeline={false} />
			) : null}
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
		</AbsoluteFill>
	);
};

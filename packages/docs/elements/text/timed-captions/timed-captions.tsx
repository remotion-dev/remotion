import type {Caption, TikTokPage, TikTokToken} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {loadFont} from '@remotion/google-fonts/Montserrat';
import {fitText, measureText} from '@remotion/layout-utils';
import React, {useEffect, useMemo, useState} from 'react';
import {
	cancelRender,
	Interactive,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export type TimedCaptionsMode = 'highlight' | 'scale' | 'background';

export type TimedCaptionsProps = {
	readonly captions?: Caption[];
	readonly mode?: TimedCaptionsMode;
	readonly combineTokensWithinMilliseconds?: number;
};

const desiredFontSize = 80;
const maximumTextWidth = 800;
const fontWeight = '700';
const textColor = '#ffffff';
const highlightColor = '#18ff0e';
const backgroundColor = '#0b84f3';
const activeWordScale = 1.2;
const pillHorizontalPadding = 12;
const pillVerticalPadding = 12;
const pillBorderRadius = 10;
const pillMoveDurationInFrames = 5;
const defaultCombineTokensWithinMilliseconds = 800;

const previewCaptions: Caption[] = [
	{
		text: 'Captions',
		startMs: 0,
		endMs: 800,
		timestampMs: 400,
		confidence: null,
	},
	{
		text: ' can',
		startMs: 800,
		endMs: 1500,
		timestampMs: 1150,
		confidence: null,
	},
	{
		text: ' move',
		startMs: 1500,
		endMs: 2300,
		timestampMs: 1900,
		confidence: null,
	},
	{
		text: ' with',
		startMs: 2300,
		endMs: 3100,
		timestampMs: 2700,
		confidence: null,
	},
	{
		text: ' every',
		startMs: 3100,
		endMs: 4000,
		timestampMs: 3550,
		confidence: null,
	},
	{
		text: ' spoken',
		startMs: 4000,
		endMs: 5100,
		timestampMs: 4550,
		confidence: null,
	},
	{
		text: ' word.',
		startMs: 5100,
		endMs: 6500,
		timestampMs: 5800,
		confidence: null,
	},
];

const {fontFamily, waitUntilDone} = loadFont('normal', {
	weights: [fontWeight],
	subsets: ['latin'],
});

export const frameToMilliseconds = (frame: number, fps: number) =>
	(frame / fps) * 1000;

export const isTimeWithinHalfOpenInterval = (
	timeMs: number,
	fromMs: number,
	toMs: number,
) => timeMs >= fromMs && timeMs < toMs;

export const getActivePageIndex = (
	pages: readonly Pick<TikTokPage, 'startMs' | 'durationMs'>[],
	timeMs: number,
) =>
	pages.findIndex((page) =>
		isTimeWithinHalfOpenInterval(
			timeMs,
			page.startMs,
			page.startMs + page.durationMs,
		),
	);

export const getActiveTokenIndex = (
	tokens: readonly Pick<TikTokToken, 'fromMs' | 'toMs'>[],
	timeMs: number,
) =>
	tokens.findIndex((token) =>
		isTimeWithinHalfOpenInterval(timeMs, token.fromMs, token.toMs),
	);

export const getLatestStartedTokenIndex = (
	tokens: readonly Pick<TikTokToken, 'fromMs'>[],
	timeMs: number,
) =>
	tokens.reduce(
		(latestIndex, token, tokenIndex) =>
			token.fromMs <= timeMs ? tokenIndex : latestIndex,
		-1,
	);

export const getTokenScale = ({
	currentTimeMs,
	fps,
	token,
}: {
	readonly currentTimeMs: number;
	readonly fps: number;
	readonly token: Pick<TikTokToken, 'fromMs' | 'toMs'>;
}) => {
	if (!isTimeWithinHalfOpenInterval(currentTimeMs, token.fromMs, token.toMs)) {
		return 1;
	}

	const tokenDurationInFrames = ((token.toMs - token.fromMs) / 1000) * fps;
	const tokenLocalFrame = ((currentTimeMs - token.fromMs) / 1000) * fps;
	const animationDurationInFrames = Math.min(4, tokenDurationInFrames / 2);
	const enterProgress = spring({
		config: {damping: 200},
		durationInFrames: animationDurationInFrames,
		fps,
		frame: tokenLocalFrame,
	});
	const exitProgress = interpolate(
		tokenLocalFrame,
		[tokenDurationInFrames - animationDurationInFrames, tokenDurationInFrames],
		[1, 0],
		{
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		},
	);

	return 1 + Math.min(enterProgress, exitProgress) * (activeWordScale - 1);
};

type TokenMeasurement = {
	readonly fullWidth: number;
	readonly visibleOffset: number;
	readonly visibleWidth: number;
};

const CaptionPage: React.FC<{
	readonly currentTimeMs: number;
	readonly fps: number;
	readonly mode: TimedCaptionsMode;
	readonly page: TikTokPage;
	readonly pageIndex: number;
}> = ({currentTimeMs, fps, mode, page, pageIndex}) => {
	const fontSize = useMemo(
		() =>
			Math.min(
				desiredFontSize,
				fitText({
					fontFamily,
					fontWeight,
					text: page.text,
					validateFontIsLoaded: true,
					withinWidth: maximumTextWidth,
				}).fontSize,
			),
		[page.text],
	);
	const tokenMeasurements = useMemo(() => {
		let currentOffset = 0;

		return page.tokens.map((token): TokenMeasurement => {
			const fullMeasurement = measureText({
				fontFamily,
				fontSize,
				fontWeight,
				text: token.text,
				validateFontIsLoaded: true,
			});
			const withoutLeadingWhitespace = measureText({
				fontFamily,
				fontSize,
				fontWeight,
				text: token.text.trimStart(),
				validateFontIsLoaded: true,
			});
			const visibleMeasurement = measureText({
				fontFamily,
				fontSize,
				fontWeight,
				text: token.text.trim(),
				validateFontIsLoaded: true,
			});
			const measurement = {
				fullWidth: fullMeasurement.width,
				visibleOffset:
					currentOffset +
					(fullMeasurement.width - withoutLeadingWhitespace.width),
				visibleWidth: visibleMeasurement.width,
			};

			currentOffset += fullMeasurement.width;
			return measurement;
		});
	}, [fontSize, page.tokens]);
	const textWidth = tokenMeasurements.reduce(
		(sum, measurement) => sum + measurement.fullWidth,
		0,
	);
	const activeTokenIndex = getActiveTokenIndex(page.tokens, currentTimeMs);
	const latestStartedTokenIndex = getLatestStartedTokenIndex(
		page.tokens,
		currentTimeMs,
	);
	const pageLocalFrame = ((currentTimeMs - page.startMs) / 1000) * fps;
	const backgroundWordIndex = page.tokens.reduce(
		(wordIndex, token, tokenIndex) => {
			if (tokenIndex === 0) {
				return wordIndex;
			}

			const tokenStartFrame = ((token.fromMs - page.startMs) / 1000) * fps;
			return (
				wordIndex +
				spring({
					config: {damping: 100},
					delay: Math.max(0, tokenStartFrame - pillMoveDurationInFrames / 2),
					durationInFrames: pillMoveDurationInFrames,
					fps,
					frame: pageLocalFrame,
				})
			);
		},
		0,
	);
	const clampedBackgroundWordIndex = Math.min(
		Math.max(backgroundWordIndex, 0),
		Math.max(0, tokenMeasurements.length - 1),
	);
	const interpolationInput = tokenMeasurements.map((_, tokenIndex) =>
		Number(tokenIndex),
	);
	const pillLeft =
		tokenMeasurements.length === 1
			? tokenMeasurements[0].visibleOffset
			: interpolate(
					clampedBackgroundWordIndex,
					interpolationInput,
					tokenMeasurements.map((measurement) => measurement.visibleOffset),
				);
	const pillWidth =
		tokenMeasurements.length === 1
			? tokenMeasurements[0].visibleWidth
			: interpolate(
					clampedBackgroundWordIndex,
					interpolationInput,
					tokenMeasurements.map((measurement) => measurement.visibleWidth),
				);
	const textStrokeWidth = fontSize / 7;

	return (
		<Interactive.Div
			name="Container"
			aria-label={page.text}
			aria-live="off"
			role="group"
			style={{
				alignItems: 'center',
				display: 'flex',
				height: '100%',
				justifyContent: 'center',
				width: '100%',
			}}
		>
			<div
				aria-hidden="true"
				style={{
					color: textColor,
					fontFamily,
					fontSize,
					fontWeight,
					lineHeight: 1.5,
					paintOrder: 'stroke fill',
					position: 'relative',
					textAlign: 'center',
					WebkitTextStroke: `${textStrokeWidth}px #000000`,
					whiteSpace: 'pre',
					width: textWidth,
				}}
			>
				{mode === 'background' && latestStartedTokenIndex >= 0 ? (
					<div
						aria-hidden="true"
						style={{
							backgroundColor,
							borderRadius: pillBorderRadius,
							height: fontSize + pillVerticalPadding * 2,
							left: pillLeft - pillHorizontalPadding,
							position: 'absolute',
							top: '50%',
							translate: '0 -50%',
							width: pillWidth + pillHorizontalPadding * 2,
						}}
					/>
				) : null}
				{page.tokens.map((token, tokenIndex) => {
					const isActive = tokenIndex === activeTokenIndex;

					return (
						<span
							key={`${pageIndex}-${page.startMs}-${token.fromMs}-${tokenIndex}`}
							style={{
								color:
									mode !== 'background' && isActive
										? highlightColor
										: textColor,
								display: 'inline-block',
								position: 'relative',
								scale:
									mode === 'scale'
										? getTokenScale({currentTimeMs, fps, token})
										: 1,
								transformOrigin: 'center bottom',
								whiteSpace: 'pre',
								zIndex: 1,
							}}
						>
							{token.text}
						</span>
					);
				})}
			</div>
		</Interactive.Div>
	);
};

export const TimedCaptions: React.FC<TimedCaptionsProps> = ({
	captions = previewCaptions,
	mode = 'background',
	combineTokensWithinMilliseconds = defaultCombineTokensWithinMilliseconds,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const [fontLoaded, setFontLoaded] = useState(false);

	useEffect(() => {
		waitUntilDone()
			.then(() => {
				setFontLoaded(true);
			})
			.catch((error) => {
				cancelRender(error instanceof Error ? error : new Error(String(error)));
			});
	}, []);

	const pages = useMemo(
		() =>
			createTikTokStyleCaptions({
				captions,
				combineTokensWithinMilliseconds,
			}).pages,
		[captions, combineTokensWithinMilliseconds],
	);
	const currentTimeMs = frameToMilliseconds(frame, fps);
	const activePageIndex = getActivePageIndex(pages, currentTimeMs);
	const page = pages[activePageIndex];

	if (!fontLoaded || !page) {
		return null;
	}

	return (
		<CaptionPage
			key={`${activePageIndex}-${page.startMs}`}
			currentTimeMs={currentTimeMs}
			fps={fps}
			mode={mode}
			page={page}
			pageIndex={activePageIndex}
		/>
	);
};

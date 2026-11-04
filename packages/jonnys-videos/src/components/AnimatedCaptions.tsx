import type {Caption, TikTokPage} from '@remotion/captions';
import {fisheye, type FisheyeParams} from '@remotion/effects/fisheye';
import {glow} from '@remotion/effects/glow';
import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Audio} from '@remotion/media';
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	AbsoluteFill,
	HtmlInCanvas,
	Interactive,
	interpolate,
	interpolateColors,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
	type InteractivitySchema,
} from 'remotion';
import {
	type CaptionPageLayout,
	createSentenceAwareCaptionPages,
} from './paginate-captions';

export const CAPTIONS_HEIGHT = 360;

export type CaptionsTheme = 'dark' | 'paper';

type AnimatedCaptionsProps = {
	readonly captions: Caption[] | null;
	readonly captionsSrc: string | null;
	readonly voiceoverSrc: string | null;
	readonly theme?: CaptionsTheme;
};

// dark: white text with a gray glow (for dark backgrounds)
// paper: ink on paper, no glow
const CAPTION_COLORS = {
	dark: {idle: '#d9d9d9', focused: '#ffffff'},
	paper: {idle: '#2a2a30', focused: '#000000'},
} as const;

const animatedCaptionsSchema = {
	...Interactive.captionsSchema,
} as const satisfies InteractivitySchema;

const SWITCH_CAPTIONS_EVERY_MS = 1100;
const RADIAL_BLUR_START = 0.5;
const RADIAL_BLUR_FOCUS_PADDING_IN_PIXELS = 8;
const CAPTION_PAGE_LAYOUT = {
	fontFamily: 'Arial Black, Arial, sans-serif',
	fontSize: 76,
	fontWeight: 900,
	letterSpacing: -3.5,
	maxLineWidth: 952,
	maxLines: 2,
	wordGap: 26,
} as const satisfies CaptionPageLayout;
type FisheyeCenter = NonNullable<FisheyeParams['center']>;
type WordFocusRegion = {
	center: FisheyeCenter;
	width: number;
	height: number;
};

const DEFAULT_WORD_FOCUS_REGION = {
	center: [0.5, 0.5],
	width: 0.16,
	height: 0.3,
} as const satisfies WordFocusRegion;

type CaptionPageProps = {
	focusProgress: number;
	focusedTokenIndex: number;
	page: TikTokPage;
	pageKey: string;
	theme: CaptionsTheme;
	onWordFocusRegions: (
		pageKey: string,
		regions: readonly WordFocusRegion[],
	) => void;
};

const CaptionPageInner: React.FC<CaptionPageProps> = ({
	focusProgress,
	focusedTokenIndex,
	page,
	pageKey,
	theme,
	onWordFocusRegions,
}) => {
	const {idle, focused} = CAPTION_COLORS[theme];
	const containerRef = useRef<HTMLDivElement>(null);
	const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const containerBounds = container.getBoundingClientRect();
		if (containerBounds.width === 0 || containerBounds.height === 0) {
			return;
		}

		const regions = wordRefs.current.map((word): WordFocusRegion => {
			if (!word) {
				return DEFAULT_WORD_FOCUS_REGION;
			}

			const wordBounds = word.getBoundingClientRect();
			return {
				center: [
					(wordBounds.left + wordBounds.width / 2 - containerBounds.left) /
						containerBounds.width,
					(wordBounds.top + wordBounds.height / 2 - containerBounds.top) /
						containerBounds.height,
				],
				width:
					(wordBounds.width + RADIAL_BLUR_FOCUS_PADDING_IN_PIXELS * 2) /
					containerBounds.width,
				height:
					(wordBounds.height + RADIAL_BLUR_FOCUS_PADDING_IN_PIXELS * 2) /
					containerBounds.height,
			};
		});

		onWordFocusRegions(pageKey, regions);
	}, [onWordFocusRegions, page.tokens, pageKey]);

	return (
		<AbsoluteFill
			showInTimeline={false}
			ref={containerRef}
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
					fontFamily: CAPTION_PAGE_LAYOUT.fontFamily,
					fontSize: CAPTION_PAGE_LAYOUT.fontSize,
					fontWeight: CAPTION_PAGE_LAYOUT.fontWeight,
					letterSpacing: CAPTION_PAGE_LAYOUT.letterSpacing,
					lineHeight: 1.05,
					textWrap: 'balance',
					whiteSpace: 'pre-wrap',
				}}
			>
				{page.tokens.map((token, tokenIndex) => {
					return (
						<span
							key={`${token.fromMs}-${tokenIndex}`}
							ref={(element) => {
								wordRefs.current[tokenIndex] = element;
							}}
							style={{
								color:
									tokenIndex === focusedTokenIndex
										? interpolateColors(focusProgress, [0, 1], [idle, focused])
										: tokenIndex === focusedTokenIndex - 1
											? interpolateColors(
													focusProgress,
													[0, 1],
													[focused, idle],
												)
											: idle,
								display: 'inline-block',
								marginLeft: tokenIndex === 0 ? 0 : 26,
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

const CaptionPage = Interactive.create({
	Component: CaptionPageInner,
	layout: 'absolute-fill',
});

const AnimatedCaptionsContent: React.FC<{
	readonly captions: Caption[];
	readonly voiceoverSrc: string | null;
	readonly theme: CaptionsTheme;
}> = ({captions, voiceoverSrc, theme}) => {
	const {fps, height, width} = useVideoConfig();
	const frame = useCurrentFrame();
	const [wordFocusRegionsByPage, setWordFocusRegionsByPage] = useState<
		Record<string, readonly WordFocusRegion[]>
	>({});

	const onWordFocusRegions = useCallback(
		(pageKey: string, regions: readonly WordFocusRegion[]) => {
			setWordFocusRegionsByPage((currentRegions) => {
				const existingRegions = currentRegions[pageKey];
				if (
					existingRegions?.length === regions.length &&
					existingRegions.every(
						(region, index) =>
							region.center[0] === regions[index].center[0] &&
							region.center[1] === regions[index].center[1] &&
							region.width === regions[index].width &&
							region.height === regions[index].height,
					)
				) {
					return currentRegions;
				}

				return {...currentRegions, [pageKey]: regions};
			});
		},
		[],
	);

	const pages = useMemo(
		() =>
			createSentenceAwareCaptionPages({
				captions,
				combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
				layout: CAPTION_PAGE_LAYOUT,
			}),
		[captions],
	);

	const currentPageIndex = pages.findIndex((page, index) => {
		const nextPage = pages[index + 1];
		const startFrame = Math.round((page.startMs / 1000) * fps);
		const naturalEndFrame = Math.ceil(
			((page.startMs + page.durationMs) / 1000) * fps,
		);
		const endFrame = nextPage
			? Math.min(Math.round((nextPage.startMs / 1000) * fps), naturalEndFrame)
			: naturalEndFrame;

		return frame >= startFrame && frame < endFrame;
	});
	const currentPage = pages[currentPageIndex] ?? null;
	const currentPageKey = currentPage
		? `${currentPage.startMs}-${currentPageIndex}`
		: null;
	const absoluteTimeMs = (frame / fps) * 1000;
	let focusedTokenIndex = 0;

	if (currentPage) {
		for (let index = 0; index < currentPage.tokens.length; index++) {
			if (currentPage.tokens[index].fromMs <= absoluteTimeMs) {
				focusedTokenIndex = index;
			}
		}
	}

	const currentPageWordFocusRegions = currentPageKey
		? wordFocusRegionsByPage[currentPageKey]
		: null;
	const firstRegion =
		currentPageWordFocusRegions?.[0] ?? DEFAULT_WORD_FOCUS_REGION;
	const lastRegion = currentPageWordFocusRegions?.at(-1) ?? firstRegion;
	const pageStartFrame = currentPage
		? Math.round((currentPage.startMs / 1000) * fps)
		: frame;
	const nextPage = pages[currentPageIndex + 1];
	const naturalEndFrame = currentPage
		? Math.ceil(((currentPage.startMs + currentPage.durationMs) / 1000) * fps)
		: frame + 1;
	const pageEndFrame = nextPage
		? Math.min(Math.round((nextPage.startMs / 1000) * fps), naturalEndFrame)
		: naturalEndFrame;
	// Move continuously for the whole page; token boundaries only change highlighting.
	const pageProgress = interpolate(
		frame,
		[pageStartFrame, Math.max(pageStartFrame + 1, pageEndFrame - 1)],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const focusedToken = currentPage?.tokens[focusedTokenIndex] ?? null;
	const focusedTokenStartFrame = focusedToken
		? Math.round((focusedToken.fromMs / 1000) * fps)
		: frame;
	const focusProgress = interpolate(
		frame,
		[focusedTokenStartFrame, focusedTokenStartFrame + Math.max(1, 0.15 * fps)],
		[0, 1],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const fisheyeCenter = [
		interpolate(
			pageProgress,
			[0, 1],
			[firstRegion.center[0], lastRegion.center[0]],
		),
		interpolate(
			pageProgress,
			[0, 1],
			[firstRegion.center[1], lastRegion.center[1]],
		),
	] as const satisfies FisheyeCenter;
	const radialBlurWidth =
		(Math.max(
			firstRegion.width,
			...(currentPageWordFocusRegions?.map((region) => region.width) ?? []),
		) *
			Math.SQRT2) /
		RADIAL_BLUR_START;
	const radialBlurHeight =
		(Math.max(
			firstRegion.height,
			...(currentPageWordFocusRegions?.map((region) => region.height) ?? []),
		) *
			Math.SQRT2) /
		RADIAL_BLUR_START;

	return (
		<>
			{voiceoverSrc ? (
				<Audio src={voiceoverSrc} hidden showInTimeline={false} />
			) : null}
			<HtmlInCanvas
				name="Animated captions canvas"
				width={width}
				height={height}
				effects={[
					glow({
						disabled: theme === 'paper',
						intensity: 0.6,
						color: 'gray',
						radius: 100,
					}),
					fisheye({
						fieldOfView: 1.5,
						radius: 3,
						center: fisheyeCenter,
						zoom: 0.8,
					}),
					radialProgressiveBlur({
						center: fisheyeCenter,
						width: radialBlurWidth,
						height: radialBlurHeight,
						start: RADIAL_BLUR_START,
						startBlur: 0,
						endBlur: 5,
					}),
				]}
			>
				{pages.map((page, index) => {
					const pageKey = `${page.startMs}-${index}`;
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
							key={pageKey}
							from={startFrame}
							durationInFrames={durationInFrames}
							showInTimeline={false}
							focusProgress={focusProgress}
							focusedTokenIndex={focusedTokenIndex}
							page={page}
							pageKey={pageKey}
							theme={theme}
							onWordFocusRegions={onWordFocusRegions}
						/>
					);
				})}
			</HtmlInCanvas>
		</>
	);
};

const FetchedAnimatedCaptions: React.FC<{
	readonly captionsSrc: string;
	readonly voiceoverSrc: string | null;
	readonly theme: CaptionsTheme;
}> = ({captionsSrc, voiceoverSrc, theme}) => {
	const [captions, setCaptions] = useState<Caption[] | null>(null);
	const {delayRender, continueRender, cancelRender} = useDelayRender();
	const [handle] = useState(() => delayRender('Loading captions'));

	useEffect(() => {
		fetch(captionsSrc)
			.then((response) => {
				if (!response.ok) {
					throw new Error(`Could not load captions (${response.status})`);
				}

				return response.json() as Promise<Caption[]>;
			})
			.then((loadedCaptions) => {
				setCaptions(loadedCaptions);
				continueRender(handle);
			})
			.catch((error) => {
				cancelRender(error);
			});
	}, [cancelRender, captionsSrc, continueRender, handle]);

	if (!captions) {
		return null;
	}

	return (
		<AnimatedCaptionsContent
			captions={captions}
			voiceoverSrc={voiceoverSrc}
			theme={theme}
		/>
	);
};

const AnimatedCaptionsInner: React.FC<AnimatedCaptionsProps> = ({
	captions,
	captionsSrc,
	voiceoverSrc,
	theme = 'dark',
}) => {
	return (
		<>
			{captions ? (
				<AnimatedCaptionsContent
					captions={captions}
					voiceoverSrc={voiceoverSrc}
					theme={theme}
				/>
			) : captionsSrc ? (
				<FetchedAnimatedCaptions
					captionsSrc={captionsSrc}
					voiceoverSrc={voiceoverSrc}
					theme={theme}
				/>
			) : null}
		</>
	);
};

export const AnimatedCaptions = Interactive.create({
	Component: AnimatedCaptionsInner,
	schema: animatedCaptionsSchema,
	layout: 'absolute-fill',
});

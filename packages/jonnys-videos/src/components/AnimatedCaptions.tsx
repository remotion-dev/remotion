import type {Caption, TikTokPage} from '@remotion/captions';
import {fisheye, type FisheyeParams} from '@remotion/effects/fisheye';
import {glow} from '@remotion/effects/glow';
import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {Audio} from '@remotion/media';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	AbsoluteFill,
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	interpolateColors,
	Sequence,
	spring,
	useCurrentFrame,
	useDelayRender,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';
import {
	type CaptionPageLayout,
	createSentenceAwareCaptionPages,
} from './paginate-captions';

export const CAPTIONS_HEIGHT = 360;

type AnimatedCaptionsProps = InteractiveBaseProps & {
	readonly captions: Caption[] | null;
	readonly captionsSrc: string | null;
	readonly voiceoverSrc: string | null;
};

const animatedCaptionsSchema = {
	...Interactive.baseSchema,
	...Interactive.captionsSchema,
} as const satisfies InteractivitySchema;

const SWITCH_CAPTIONS_EVERY_MS = 1100;
const FISHEYE_CENTER_MOVE_MAX_DURATION_IN_SECONDS = 0.2;
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
	onWordFocusRegions: (
		pageKey: string,
		regions: readonly WordFocusRegion[],
	) => void;
};

const CaptionPage: React.FC<CaptionPageProps> = ({
	focusProgress,
	focusedTokenIndex,
	page,
	pageKey,
	onWordFocusRegions,
}) => {
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
							ref={(element) => {
								wordRefs.current[tokenIndex] = element;
							}}
							key={`${token.fromMs}-${tokenIndex}`}
							style={{
								color:
									tokenIndex === focusedTokenIndex
										? interpolateColors(
												focusProgress,
												[0, 1],
												['#d9d9d9', '#ffffff'],
											)
										: tokenIndex === focusedTokenIndex - 1
											? interpolateColors(
													focusProgress,
													[0, 1],
													['#ffffff', '#d9d9d9'],
												)
											: '#d9d9d9',
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

const AnimatedCaptionsContent: React.FC<{
	readonly captions: Caption[];
	readonly voiceoverSrc: string | null;
}> = ({captions, voiceoverSrc}) => {
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
	const targetRegion =
		currentPageWordFocusRegions?.[focusedTokenIndex] ??
		DEFAULT_WORD_FOCUS_REGION;
	const previousRegion = currentPageWordFocusRegions?.[
		focusedTokenIndex - 1
	] ?? {
		...DEFAULT_WORD_FOCUS_REGION,
		width: targetRegion.width,
		height: targetRegion.height,
	};
	const focusedToken = currentPage?.tokens[focusedTokenIndex] ?? null;
	const focusedTokenStartFrame = focusedToken
		? Math.round((focusedToken.fromMs / 1000) * fps)
		: frame;
	const focusedTokenDurationInFrames = focusedToken
		? Math.max(
				2,
				Math.round(((focusedToken.toMs - focusedToken.fromMs) / 1000) * fps),
			)
		: 2;
	const focusedTokenFrame = frame - focusedTokenStartFrame;
	const centerProgress = !focusedToken
		? 1
		: spring({
				frame: focusedTokenFrame,
				fps,
				durationInFrames: Math.max(
					1,
					Math.min(
						focusedTokenDurationInFrames,
						Math.round(FISHEYE_CENTER_MOVE_MAX_DURATION_IN_SECONDS * fps),
					),
				),
				config: {
					damping: 200,
					overshootClamping: true,
				},
			});
	const focusProgress = interpolate(centerProgress, [0, 1], [0, 1], {
		easing: Easing.spring({damping: 200}),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fisheyeCenter = [
		interpolate(
			focusProgress,
			[0, 1],
			[previousRegion.center[0], targetRegion.center[0]],
		),
		interpolate(
			focusProgress,
			[0, 1],
			[previousRegion.center[1], targetRegion.center[1]],
		),
	] as const satisfies FisheyeCenter;
	const radialBlurWidth =
		(interpolate(
			centerProgress,
			[0, 1],
			[previousRegion.width, targetRegion.width],
		) *
			Math.SQRT2) /
		RADIAL_BLUR_START;
	const radialBlurHeight =
		(interpolate(
			centerProgress,
			[0, 1],
			[previousRegion.height, targetRegion.height],
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
				<AbsoluteFill>
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
							<Sequence
								key={pageKey}
								from={startFrame}
								durationInFrames={durationInFrames}
								premountFor={fps}
								showInTimeline={false}
							>
								<CaptionPage
									focusProgress={focusProgress}
									focusedTokenIndex={focusedTokenIndex}
									page={page}
									pageKey={pageKey}
									onWordFocusRegions={onWordFocusRegions}
								/>
							</Sequence>
						);
					})}
				</AbsoluteFill>
			</HtmlInCanvas>
		</>
	);
};

const FetchedAnimatedCaptions: React.FC<{
	readonly captionsSrc: string;
	readonly voiceoverSrc: string | null;
}> = ({captionsSrc, voiceoverSrc}) => {
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
		<AnimatedCaptionsContent captions={captions} voiceoverSrc={voiceoverSrc} />
	);
};

const AnimatedCaptionsInner = forwardRef<
	HTMLDivElement,
	AnimatedCaptionsProps & {readonly controls: SequenceControls | undefined}
>((props, ref) => {
	const {
		captions,
		captionsSrc,
		controls,
		name,
		voiceoverSrc,
		...interactiveProps
	} = props;
	const outlineRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

	return (
		<Sequence
			layout="none"
			{...interactiveProps}
			controls={controls}
			name={name ?? '<AnimatedCaptions>'}
			outlineRef={outlineRef}
		>
			<AbsoluteFill ref={outlineRef}>
				{captions ? (
					<AnimatedCaptionsContent
						captions={captions}
						voiceoverSrc={voiceoverSrc}
					/>
				) : captionsSrc ? (
					<FetchedAnimatedCaptions
						captionsSrc={captionsSrc}
						voiceoverSrc={voiceoverSrc}
					/>
				) : null}
			</AbsoluteFill>
		</Sequence>
	);
});

export const AnimatedCaptions = Interactive.withSchema({
	Component: AnimatedCaptionsInner,
	componentName: '<AnimatedCaptions>',
	componentIdentity: null,
	schema: animatedCaptionsSchema,
	supportsEffects: false,
}) as React.FC<AnimatedCaptionsProps>;

import type {Caption, TikTokPage, TikTokToken} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {loadFont} from '@remotion/google-fonts/Montserrat';
import {fitText} from '@remotion/layout-utils';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	cancelRender,
	Interactive,
	interpolate,
	Sequence,
	spring,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
	type SequenceProps,
} from 'remotion';

type MovingPillCaptionsProps = InteractiveBaseProps &
	InteractiveTransformProps &
	Pick<SequenceProps, 'width' | 'height'> & {
		readonly captions?: Caption[];
		readonly combineTokensWithinMilliseconds?: number;
	};

type MovingPillCaptionsLayerProps = Omit<
	MovingPillCaptionsProps,
	'captions'
> & {
	readonly captions: Caption[];
};

const desiredFontSize = 80;
const maximumTextWidth = 800;
const fontWeight = '700';
const textColor = '#ffffff';
const backgroundColor = '#0b84f3';
const pillHorizontalPadding = 12;
const pillVerticalPadding = 12;
const pillBorderRadius = 10;
const pillMoveDurationInFrames = 5;
const defaultCombineTokensWithinMilliseconds = 800;

const movingPillCaptionsSchema = {
	...Interactive.baseSchema,
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
	combineTokensWithinMilliseconds: {
		type: 'number',
		min: 0,
		step: 50,
		default: defaultCombineTokensWithinMilliseconds,
		description: 'Time between caption pages',
		hiddenFromList: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const {fontFamily, waitUntilDone} = loadFont('normal', {
	weights: [fontWeight],
	subsets: ['latin'],
});

const frameToMilliseconds = (frame: number, fps: number) =>
	(frame / fps) * 1000;

const isTimeWithinHalfOpenInterval = (
	timeMs: number,
	fromMs: number,
	toMs: number,
) => timeMs >= fromMs && timeMs < toMs;

const getActivePageIndex = (
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

const getLatestStartedTokenIndex = (
	tokens: readonly Pick<TikTokToken, 'fromMs'>[],
	timeMs: number,
) =>
	tokens.reduce(
		(latestIndex, token, tokenIndex) =>
			token.fromMs <= timeMs ? tokenIndex : latestIndex,
		-1,
	);

type TokenLayout = {
	readonly height: number;
	readonly left: number;
	readonly top: number;
	readonly width: number;
};

const CaptionPage: React.FC<{
	readonly captionAreaWidth: number | null;
	readonly currentTimeMs: number;
	readonly fps: number;
	readonly page: TikTokPage;
	readonly pageIndex: number;
}> = ({captionAreaWidth, currentTimeMs, fps, page, pageIndex}) => {
	const fontSize = useMemo(() => {
		const availableWidth = Math.min(
			maximumTextWidth,
			captionAreaWidth ?? maximumTextWidth,
		);
		const maximumTokenWidth = Math.max(
			1,
			availableWidth - pillHorizontalPadding * 2,
		);
		const tokenFontSizes = page.tokens
			.map((token) => token.text.trim())
			.filter(Boolean)
			.map(
				(text) =>
					fitText({
						fontFamily,
						fontWeight,
						text,
						validateFontIsLoaded: true,
						withinWidth: maximumTokenWidth,
					}).fontSize,
			);

		return Math.min(
			desiredFontSize,
			fitText({
				fontFamily,
				fontWeight,
				text: page.text,
				validateFontIsLoaded: true,
				withinWidth: maximumTextWidth,
			}).fontSize,
			...tokenFontSizes,
		);
	}, [captionAreaWidth, page.text, page.tokens]);
	const textContainerRef = useRef<HTMLDivElement>(null);
	const tokenRefs = useRef<Array<HTMLSpanElement | null>>([]);
	const [tokenLayouts, setTokenLayouts] = useState<TokenLayout[]>([]);

	useLayoutEffect(() => {
		const container = textContainerRef.current;

		if (!container) {
			return;
		}

		const updateTokenLayouts = () => {
			setTokenLayouts(
				page.tokens.map((_, tokenIndex) => {
					const token = tokenRefs.current[tokenIndex];

					if (!token) {
						return {height: 0, left: 0, top: 0, width: 0};
					}

					return {
						height: token.offsetHeight,
						left: token.offsetLeft,
						top: token.offsetTop,
						width: token.offsetWidth,
					};
				}),
			);
		};

		updateTokenLayouts();
		const resizeObserver = new ResizeObserver(updateTokenLayouts);
		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	}, [fontSize, page.tokens]);
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
	const hasTokenLayouts = tokenLayouts.length === page.tokens.length;
	const clampedBackgroundWordIndex = Math.min(
		Math.max(backgroundWordIndex, 0),
		Math.max(0, tokenLayouts.length - 1),
	);
	const interpolationInput = tokenLayouts.map((_, tokenIndex) =>
		Number(tokenIndex),
	);
	const interpolateTokenLayout = (values: number[]) => {
		if (values.length === 0) {
			return 0;
		}

		if (values.length === 1) {
			return values[0];
		}

		return interpolate(clampedBackgroundWordIndex, interpolationInput, values);
	};
	const pillHeight = fontSize + pillVerticalPadding * 2;
	const pillLeft = interpolateTokenLayout(
		tokenLayouts.map((measurement) => measurement.left),
	);
	const pillTop = interpolateTokenLayout(
		tokenLayouts.map(
			(measurement) => measurement.top + (measurement.height - pillHeight) / 2,
		),
	);
	const pillWidth = interpolateTokenLayout(
		tokenLayouts.map((measurement) => measurement.width),
	);
	const textStrokeWidth = fontSize / 7;

	return (
		<div
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
				ref={textContainerRef}
				aria-hidden="true"
				style={{
					color: textColor,
					fontFamily,
					fontSize,
					fontWeight,
					lineHeight: 1.5,
					maxWidth: maximumTextWidth,
					paintOrder: 'stroke fill',
					position: 'relative',
					textAlign: 'center',
					WebkitTextStroke: `${textStrokeWidth}px #000000`,
					whiteSpace: 'normal',
					width: '100%',
				}}
			>
				{hasTokenLayouts && latestStartedTokenIndex >= 0 ? (
					<div
						aria-hidden="true"
						style={{
							backgroundColor,
							borderRadius: pillBorderRadius,
							height: pillHeight,
							left: pillLeft - pillHorizontalPadding,
							position: 'absolute',
							top: pillTop,
							width: pillWidth + pillHorizontalPadding * 2,
						}}
					/>
				) : null}
				{page.tokens.map((token, tokenIndex) => {
					const visibleText = token.text.trim();
					const visibleTextIndex = token.text.indexOf(visibleText);
					const leadingWhitespace = visibleText
						? token.text.slice(0, visibleTextIndex)
						: token.text;
					const trailingWhitespace = visibleText
						? token.text.slice(visibleTextIndex + visibleText.length)
						: '';

					return (
						<React.Fragment
							key={`${pageIndex}-${page.startMs}-${token.fromMs}-${tokenIndex}`}
						>
							{leadingWhitespace}
							<span
								ref={(element) => {
									tokenRefs.current[tokenIndex] = element;
								}}
								style={{
									color: textColor,
									display: 'inline-block',
									position: 'relative',
									whiteSpace: 'pre',
									zIndex: 1,
								}}
							>
								{visibleText}
							</span>
							{trailingWhitespace}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};

const MovingPillCaptionsContent: React.FC<{
	readonly captionAreaWidth: number | null;
	readonly captions: Caption[];
	readonly combineTokensWithinMilliseconds: number;
	readonly fontLoaded: boolean;
}> = ({
	captionAreaWidth,
	captions,
	combineTokensWithinMilliseconds,
	fontLoaded,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
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
			captionAreaWidth={captionAreaWidth}
			currentTimeMs={currentTimeMs}
			fps={fps}
			page={page}
			pageIndex={activePageIndex}
		/>
	);
};

const MovingPillCaptionsInner = forwardRef<
	HTMLDivElement,
	MovingPillCaptionsLayerProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			captions,
			combineTokensWithinMilliseconds = defaultCombineTokensWithinMilliseconds,
			controls,
			height,
			name,
			style,
			width,
			...interactiveProps
		},
		ref,
	) => {
		const outlineRef = useRef<HTMLDivElement>(null);
		const [fontLoaded, setFontLoaded] = useState(false);

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		useEffect(() => {
			waitUntilDone()
				.then(() => {
					setFontLoaded(true);
				})
				.catch((error) => {
					cancelRender(
						error instanceof Error ? error : new Error(String(error)),
					);
				});
		}, []);

		return (
			<Sequence
				layout="none"
				{...interactiveProps}
				controls={controls}
				name={name ?? '<MovingPillCaptions>'}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						height: height ?? '100%',
						width: width ?? '100%',
						...style,
					}}
				>
					<MovingPillCaptionsContent
						captionAreaWidth={width ?? null}
						captions={captions}
						combineTokensWithinMilliseconds={combineTokensWithinMilliseconds}
						fontLoaded={fontLoaded}
					/>
				</div>
			</Sequence>
		);
	},
);

const MovingPillCaptionsLayer = Interactive.withSchema({
	Component: MovingPillCaptionsInner,
	componentName: '<MovingPillCaptions>',
	componentIdentity: null,
	schema: movingPillCaptionsSchema,
	supportsEffects: false,
}) as React.FC<MovingPillCaptionsLayerProps>;

export const MovingPillCaptions: React.FC<MovingPillCaptionsProps> = ({
	captions,
	...props
}) => {
	if (captions) {
		return <MovingPillCaptionsLayer {...props} captions={captions} />;
	}

	return (
		<div
			style={{
				alignItems: 'center',
				display: 'flex',
				height: 180,
				justifyContent: 'center',
				width: 900,
			}}
		>
			<MovingPillCaptionsLayer
				{...props}
				captions={[
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
				]}
				width={681}
				height={252}
			/>
		</div>
	);
};

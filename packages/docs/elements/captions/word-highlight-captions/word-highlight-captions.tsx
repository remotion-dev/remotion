import type {Caption, TikTokPage, TikTokToken} from '@remotion/captions';
import {createTikTokStyleCaptions} from '@remotion/captions';
import {loadFont} from '@remotion/google-fonts/Montserrat';
import {fitText} from '@remotion/layout-utils';
import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	cancelRender,
	Interactive,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
	type SequenceProps,
} from 'remotion';

type WordHighlightCaptionsProps = InteractiveBaseProps &
	InteractiveTransformProps &
	Pick<SequenceProps, 'width' | 'height'> & {
		readonly captions?: Caption[];
		readonly combineTokensWithinMilliseconds?: number;
	};

type WordHighlightCaptionsLayerProps = Omit<
	WordHighlightCaptionsProps,
	'captions'
> & {
	readonly captions: Caption[];
};

const desiredFontSize = 80;
const maximumTextWidth = 800;
const fontWeight = '700';
const textColor = '#ffffff';
const highlightColor = '#18ff0e';
const defaultCombineTokensWithinMilliseconds = 800;

const wordHighlightCaptionsSchema = {
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

const getActiveTokenIndex = (
	tokens: readonly Pick<TikTokToken, 'fromMs' | 'toMs'>[],
	timeMs: number,
) =>
	tokens.findIndex((token) =>
		isTimeWithinHalfOpenInterval(timeMs, token.fromMs, token.toMs),
	);

const CaptionPage: React.FC<{
	readonly captionAreaWidth: number | null;
	readonly currentTimeMs: number;
	readonly page: TikTokPage;
	readonly pageIndex: number;
}> = ({captionAreaWidth, currentTimeMs, page, pageIndex}) => {
	const fontSize = useMemo(() => {
		const availableWidth = Math.min(
			maximumTextWidth,
			captionAreaWidth ?? maximumTextWidth,
		);
		const maximumTokenWidth = Math.max(1, availableWidth);
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
	const activeTokenIndex = getActiveTokenIndex(page.tokens, currentTimeMs);
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
				aria-hidden="true"
				style={{
					color: textColor,
					fontFamily,
					fontSize,
					fontWeight,
					lineHeight: 1.5,
					maxWidth: maximumTextWidth,
					paintOrder: 'stroke fill',
					textAlign: 'center',
					WebkitTextStroke: `${textStrokeWidth}px #000000`,
					whiteSpace: 'normal',
					width: '100%',
				}}
			>
				{page.tokens.map((token, tokenIndex) => {
					const isActive = tokenIndex === activeTokenIndex;
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
								style={{
									color: isActive ? highlightColor : textColor,
									display: 'inline-block',
									whiteSpace: 'pre',
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

const WordHighlightCaptionsContent: React.FC<{
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
			page={page}
			pageIndex={activePageIndex}
		/>
	);
};

const WordHighlightCaptionsInner = forwardRef<
	HTMLDivElement,
	WordHighlightCaptionsLayerProps & {
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
				name={name ?? '<WordHighlightCaptions>'}
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
					<WordHighlightCaptionsContent
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

const WordHighlightCaptionsLayer = Interactive.withSchema({
	Component: WordHighlightCaptionsInner,
	componentName: '<WordHighlightCaptions>',
	componentIdentity: null,
	schema: wordHighlightCaptionsSchema,
	supportsEffects: false,
}) as React.FC<WordHighlightCaptionsLayerProps>;

export const WordHighlightCaptions: React.FC<WordHighlightCaptionsProps> = ({
	captions,
	...props
}) => {
	if (captions) {
		return <WordHighlightCaptionsLayer {...props} captions={captions} />;
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
			<WordHighlightCaptionsLayer
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

import {evolve} from '@remotion/effects/evolve';
import {loadFont} from '@remotion/fonts';
import {
	TransitionSeries,
	crossZoom,
	dreamyZoom,
	filmBurn,
	linearBlur,
	linearTiming,
	type TransitionPresentation,
} from '@remotion/transitions';
import {bookFlip} from '@remotion/transitions/book-flip';
import {crosswarp} from '@remotion/transitions/crosswarp';
import {ripple} from '@remotion/transitions/ripple';
import {swap} from '@remotion/transitions/swap';
import {zoomBlur} from '@remotion/transitions/zoom-blur';
import {zoomInOut} from '@remotion/transitions/zoom-in-out';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	HtmlInCanvas,
	Img,
	Sequence,
	interpolate,
	staticFile,
	useCurrentFrame,
	type CalculateMetadataFunction,
} from 'remotion';
import {z} from 'zod';

const BRAND_FONT_FAMILY = 'GT Planar';
const SCENE_DURATION = 34;
const TRANSITION_DURATION = 24;
const EFFECT_DURATION = SCENE_DURATION * 2 - TRANSITION_DURATION;
const PREMOUNT_DURATION = 30;

export const htmlInCanvasAllEffectsSchema = z.object({
	format: z.enum(['widescreen', 'instagram']).default('widescreen'),
});

export type HtmlInCanvasAllEffectsProps = z.infer<
	typeof htmlInCanvasAllEffectsSchema
>;

export const htmlInCanvasAllEffectsDefaultProps: HtmlInCanvasAllEffectsProps = {
	format: 'widescreen',
};

type LayoutConfig = {
	readonly width: number;
	readonly height: number;
	readonly previewWidth: number;
	readonly previewHeight: number;
	readonly previewBorderRadius: number;
	readonly labelMarginTop: number;
	readonly labelFontSize: number;
};

const layoutConfigs: Record<
	HtmlInCanvasAllEffectsProps['format'],
	LayoutConfig
> = {
	widescreen: {
		width: 1920,
		height: 1080,
		previewWidth: 1360,
		previewHeight: 765,
		previewBorderRadius: 18,
		labelMarginTop: 54,
		labelFontSize: 72,
	},
	instagram: {
		width: 1080,
		height: 1350,
		previewWidth: 900,
		previewHeight: 506,
		previewBorderRadius: 16,
		labelMarginTop: 48,
		labelFontSize: 68,
	},
};

loadFont({
	family: BRAND_FONT_FAMILY,
	url: staticFile('GT Planar/GT-Planar-Medium.woff2'),
	weight: '500',
});

type EffectConfig = {
	readonly name: string;
	readonly presentation: TransitionPresentation<Record<string, unknown>>;
};

const makeEffect = <Props extends Record<string, unknown>>(
	name: string,
	presentation: TransitionPresentation<Props>,
): EffectConfig => {
	return {
		name,
		presentation: presentation as TransitionPresentation<
			Record<string, unknown>
		>,
	};
};

const htmlInCanvasEffects = [
	makeEffect('zoomBlur()', zoomBlur({})),
	makeEffect('dreamyZoom()', dreamyZoom({})),
	makeEffect('filmBurn()', filmBurn({})),
	makeEffect('linearBlur()', linearBlur({intensity: 0.18})),
	makeEffect('bookFlip()', bookFlip({})),
	makeEffect('zoomInOut()', zoomInOut({})),
	makeEffect('ripple()', ripple({})),
	makeEffect('crosswarp()', crosswarp({})),
	makeEffect('crossZoom()', crossZoom({})),
	makeEffect('swap()', swap({})),
] satisfies EffectConfig[];

export const HTML_IN_CANVAS_ALL_EFFECTS_DURATION =
	htmlInCanvasEffects.length * EFFECT_DURATION;

export const calculateHtmlInCanvasAllEffectsMetadata: CalculateMetadataFunction<
	HtmlInCanvasAllEffectsProps
> = ({props}) => {
	const layout = layoutConfigs[props.format];

	return {
		durationInFrames: HTML_IN_CANVAS_ALL_EFFECTS_DURATION,
		fps: 30,
		width: layout.width,
		height: layout.height,
	};
};

type ImageVariant = 'blue' | 'pink';

const imageVariants: Record<
	ImageVariant,
	{readonly letter: string; readonly src: string}
> = {
	blue: {
		letter: 'A',
		src: 'https://remotion.media/transition-bg-blue.jpg',
	},
	pink: {
		letter: 'B',
		src: 'https://remotion.media/transition-bg-pink.jpg',
	},
};

const backgroundImageStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	width: '100%',
	height: '100%',
	objectFit: 'cover',
};

const sceneStyle: React.CSSProperties = {
	justifyContent: 'center',
	alignItems: 'center',
	fontFamily: 'sans-serif',
	fontWeight: 900,
	color: 'white',
	fontSize: '35cqmin',
};

const letterStyle: React.CSSProperties = {
	position: 'relative',
	textShadow: '0 8px 44px rgba(0, 0, 0, 0.55)',
};

const slideStyle: React.CSSProperties = {
	backgroundColor: 'white',
	justifyContent: 'center',
	alignItems: 'center',
};

const previewFrameStyle: React.CSSProperties = {
	position: 'relative',
	overflow: 'hidden',
	containerType: 'size',
	backgroundColor: 'white',
	boxShadow: '0 22px 70px rgba(15, 23, 42, 0.14)',
};

const labelStyle: React.CSSProperties = {
	fontFamily: BRAND_FONT_FAMILY,
	fontWeight: 500,
	lineHeight: 1,
	color: '#111827',
};

const Scene: React.FC<{
	readonly variant: ImageVariant;
}> = ({variant}) => {
	const image = imageVariants[variant];

	return (
		<AbsoluteFill style={sceneStyle}>
			<Img
				crossOrigin="anonymous"
				src={image.src}
				style={backgroundImageStyle}
				alt=""
			/>
			<div style={letterStyle}>{image.letter}</div>
		</AbsoluteFill>
	);
};

const getImageVariants = (index: number) => {
	const from = index % 2 === 0 ? 'blue' : 'pink';
	const to = from === 'blue' ? 'pink' : 'blue';

	return {from, to} as const;
};

const EffectSlide: React.FC<{
	readonly effect: EffectConfig;
	readonly index: number;
	readonly layout: LayoutConfig;
}> = ({effect, index, layout}) => {
	const frame = useCurrentFrame();
	const {from, to} = getImageVariants(index);

	return (
		<AbsoluteFill style={slideStyle}>
			<div
				style={{
					...previewFrameStyle,
					width: layout.previewWidth,
					height: layout.previewHeight,
					borderRadius: layout.previewBorderRadius,
				}}
			>
				<TransitionSeries>
					<TransitionSeries.Sequence durationInFrames={SCENE_DURATION - 10}>
						<Scene variant={from} />
					</TransitionSeries.Sequence>
					<TransitionSeries.Transition
						presentation={effect.presentation}
						timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
					/>
					<TransitionSeries.Sequence durationInFrames={SCENE_DURATION + 10}>
						<Scene variant={to} />
					</TransitionSeries.Sequence>
				</TransitionSeries>
			</div>
			<HtmlInCanvas
				height={140}
				width={1080}
				style={{textAlign: 'center'}}
				effects={[
					evolve({
						progress: interpolate(frame, [-2, 15], [0.09, 0.83], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.25, 0.25, 0.6884, 1.375)],
						}),
						direction: 'left',
						feather: 0.1,
					}),
					evolve({
						progress: interpolate(frame, [35, 44], [0.8300000000000001, 0.06], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						direction: 'right',
						feather: 0.1,
					}),
				]}
			>
				<div
					style={{
						...labelStyle,
						marginTop: layout.labelMarginTop,
						fontSize: layout.labelFontSize,
					}}
				>
					{effect.name}
				</div>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const HtmlInCanvasAllEffects: React.FC<HtmlInCanvasAllEffectsProps> = ({
	format,
}) => {
	const layout = layoutConfigs[format];

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			{htmlInCanvasEffects.map((effect, index) => {
				return (
					<Sequence
						key={effect.name}
						from={index * EFFECT_DURATION}
						durationInFrames={EFFECT_DURATION}
						premountFor={PREMOUNT_DURATION}
					>
						<EffectSlide effect={effect} index={index} layout={layout} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

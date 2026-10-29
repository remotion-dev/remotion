import {lensBlur} from '@remotion/effects/lens-blur';
import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {vignette} from '@remotion/effects/vignette';
import {Video} from '@remotion/media';
import {noise2D} from '@remotion/noise';
import {TransitionSeries} from '@remotion/transitions';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {auraCodeAssets} from './aura-code-assets';
import {oledScreen} from './effects/oled-screen-effect';

// Captures use a 3600 × 2400 canvas. Camera and effect keyframes stay inline.
// Zoom around a fixed optical axis; defocus follows the speed of the lens turn.
const ChaptersShot = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	// Sample the same scale curve authored below so blur cannot run after the zoom.
	const [beforeScale, afterScale] = [frame - 0.5, frame + 0.5].map(
		(sampleFrame) =>
			interpolate(sampleFrame, [0, durationInFrames - 1], [0.82, 0.94], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: Easing.bezier(0.32, 0, 0.2, 1),
				output: 'perceptual-scale',
			}),
	);
	const zoomSpeed =
		frame <= 0 || frame >= durationInFrames - 1
			? 0
			: fps * Math.abs(Math.log(afterScale / beforeScale));
	const handPressure = Math.min(1, zoomSpeed / 0.186);
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#131414',
				overflow: 'hidden',
			}}
		>
			<AbsoluteFill
				style={{
					perspective: 3200,
					translate: `${noise2D('aura-lens-hand-x', (frame / fps) * 3, 1.7) * 2.5 * handPressure}px ${noise2D('aura-lens-hand-y', 4.2, (frame / fps) * 2.6) * 1.5 * handPressure}px`,
					rotate: `${noise2D('aura-lens-hand-roll', (frame / fps) * 2.2, 8.3) * 0.06 * handPressure}deg`,
				}}
			>
				<CanvasImage
					name="WhatsNew · native-resolution closeup"
					src={auraCodeAssets.code.chapters}
					style={{
						position: 'absolute',
						width: 3600,
						height: 2400,
						left: -180,
						top: -190,
						transformOrigin: '1140px 730px',
						scale: interpolate(frame, [0, durationInFrames - 1], [0.82, 0.94], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.bezier(0.32, 0, 0.2, 1),
							output: 'perceptual-scale',
						}),
						rotate: '0 1 0 12deg',
					}}
					effects={[
						lensBlur({
							radius: 220 * zoomSpeed,
							irisShape: 'hexagon',
							irisRoundness: 0.15,
							highlightGain: Math.min(0.06, 0.35 * zoomSpeed),
							highlightThreshold: 0.45,
							linearLight: true,
							samples: 512,
							repeatEdgePixels: true,
						}),
					]}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const AuraCodeChapters = Interactive.create({
	Component: ChaptersShot,
	layout: 'absolute-fill',
});

const DuplicateShot = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#131414',
				overflow: 'hidden',
				perspective: 2200,
			}}
		>
			<Video
				name="WhatsNew · select a chapter"
				src={auraCodeAssets.code.duplicate}
				muted
				style={{
					position: 'absolute',
					width: 3600,
					height: 2400,
					left: 193,
					top: -172,
					transformOrigin: '767px 712px',
					scale: 1.14,
					rotate: '-0.5 1 0.3 10deg',
				}}
				effects={[
					radialProgressiveBlur({
						center: [0.2131, 0.2967],
						width: 0.85,
						height: 0.85,
						start: 0.4,
						endBlur: 85,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export const AuraCodeDuplicate = Interactive.create({
	Component: DuplicateShot,
	layout: 'absolute-fill',
});

const StylesShot = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#131414',
				overflow: 'hidden',
				perspective: 6000,
			}}
		>
			<CanvasImage
				name="LowerThird · HTML and CSS"
				src={auraCodeAssets.code.styles}
				style={{
					position: 'absolute',
					width: 3600,
					height: 2400,
					left: -790,
					top: -310,
					transformOrigin: '1750px 850px',
					scale: 0.96,
					rotate: interpolate(
						frame,
						[0, durationInFrames - 1],
						['0.4 -0.25 1 10deg', '0.4 -0.25 1 -8deg'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.linear,
						},
					),
				}}
				effects={[
					radialProgressiveBlur({
						center: [0.4861, 0.3542],
						width: 0.74,
						height: 0.62,
						start: 0.2,
						startBlur: 1.5,
						endBlur: interpolate(
							frame,
							[0, (durationInFrames - 1) / 2, durationInFrames - 1],
							[18, 30, 22],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.inOut(Easing.sin),
							},
						),
					}),
					vignette({
						center: [0.4861, 0.3542],
						amount: 0.16,
						radius: 0.24,
						feather: 0.55,
						roundness: 1,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export const AuraCodeStyles = Interactive.create({
	Component: StylesShot,
	layout: 'absolute-fill',
});

const CaptionsShot = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#131414',
				overflow: 'hidden',
				perspective: 2200,
			}}
		>
			<CanvasImage
				name="Scene1 · caption markup"
				src={auraCodeAssets.code.captions}
				style={{
					position: 'absolute',
					width: 3600,
					height: 2400,
					left: -680,
					top: -940,
					transformOrigin: '1040px 1490px',
					rotate: '0 1 0 34deg',
					scale: interpolate(frame, [0, durationInFrames - 1], [1.88, 1.98], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.linear,
						output: 'perceptual-scale',
					}),
				}}
				effects={[
					lensBlur({radius: 0.75, samples: 128, repeatEdgePixels: true}),
					oledScreen({pixelSize: 6, strength: 0.65}),
					radialProgressiveBlur({
						center: [0.3056, 0.6125],
						width: 0.52,
						height: 1.2,
						start: 0.2,
						startBlur: 0.125,
						endBlur: 12,
					}),
					vignette({
						center: [0.3056, 0.6125],
						amount: 0.15,
						radius: 0.135,
						feather: 0.28,
						roundness: 1,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export const AuraCodeCaptions = Interactive.create({
	Component: CaptionsShot,
	layout: 'absolute-fill',
});

const CutFlashInner = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				zIndex: 20,
				backgroundColor: '#000000',
				opacity: interpolate(
					frame,
					[
						0,
						durationInFrames / 3,
						durationInFrames / 2,
						(durationInFrames * 2) / 3,
						durationInFrames - 1,
					],
					[0, 0.08, 1, 0.24, 0],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: Easing.inOut(Easing.quad),
					},
				),
			}}
		/>
	);
};

export const AuraCodeFlash = Interactive.create({
	Component: CutFlashInner,
	layout: 'absolute-fill',
});

export const AuraCode = () => {
	const {fps} = useVideoConfig();
	return (
		<TransitionSeries name="Code aura · compose, style, reuse, caption">
			<TransitionSeries.Sequence
				name="01 · Composition"
				durationInFrames={2 * fps}
			>
				<AuraCodeChapters />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={0.2 * fps}>
				<AuraCodeFlash name="Black flash into HTML and CSS" />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence
				name="02 · HTML and CSS"
				durationInFrames={2 * fps}
			>
				<AuraCodeStyles />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={0.2 * fps}>
				<AuraCodeFlash name="Black flash into chapter selection" />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence
				name="03 · Select a chapter"
				durationInFrames={1.4 * fps}
			>
				<AuraCodeDuplicate />
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={0.2 * fps}>
				<AuraCodeFlash name="Black flash into captions" />
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence
				name="04 · Captions"
				durationInFrames={2 * fps}
			>
				<AuraCodeCaptions />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

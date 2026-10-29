import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {vignette} from '@remotion/effects/vignette';
import {TransitionSeries} from '@remotion/transitions';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {auraCodeAssets} from './aura-code-assets';
import {
	AuraCodeCaptions,
	AuraCodeChapters,
	AuraCodeDuplicate,
	AuraCodeFlash,
	AuraCodeStyles,
} from './AuraCode';

type TimelineView = 'chapters' | 'styles' | 'selection' | 'captions';

const TimelineCamera = ({view}: {readonly view: TimelineView}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const camera = {
		chapters: {x: 800, y: 480, scale: [1.4, 1.55], angle: [16, 10]},
		styles: {x: 340, y: 330, scale: [2.6, 2.85], angle: [-8, 8]},
		selection: {x: 1450, y: 370, scale: [1.45, 1.55], angle: [8, 2]},
		captions: {x: 1360, y: 558, scale: [2.7, 3], angle: [20, 28]},
	}[view];
	const focus = {
		chapters: {
			width: 0.33,
			height: 0.5,
			start: 0.65,
			centerBlur: 0.5,
			outerBlur: [9, 13, 11],
			vignette: {amount: 0.3, radius: 0.18, feather: 0.28},
		},
		styles: {
			width: 0.18,
			height: 0.3,
			start: 0.65,
			centerBlur: 0.35,
			outerBlur: [9, 13, 10],
			vignette: {amount: 0.3, radius: 0.07, feather: 0.18},
		},
		selection: {
			width: 0.28,
			height: 0.38,
			start: 0.6,
			centerBlur: 0.45,
			outerBlur: [10, 15, 12],
			vignette: {amount: 0.28, radius: 0.16, feather: 0.3},
		},
		captions: {
			width: 0.16,
			height: 0.12,
			start: 0.6,
			centerBlur: 0.35,
			outerBlur: [8, 11, 9],
			vignette: {amount: 0.28, radius: 0.06, feather: 0.16},
		},
	}[view];
	const focusX = view === 'styles' ? 480 : camera.x;
	const focusY =
		view === 'selection' ? 270 : view === 'styles' ? 374 : camera.y;
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#15191c',
				overflow: 'hidden',
				perspective: 3600,
			}}
		>
			<CanvasImage
				name="Native Studio timeline"
				src={auraCodeAssets.timeline[view]}
				style={{
					position: 'absolute',
					width: 5120,
					height: 1964,
					left: 960 - camera.x,
					top: 540 - camera.y,
					transformOrigin: `${camera.x}px ${camera.y}px`,
					scale: interpolate(frame, [0, durationInFrames - 1], camera.scale, {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
						easing: Easing.bezier(0.3, 0.1, 0.5, 0.9),
					}),
					rotate: interpolate(
						frame,
						[0, durationInFrames - 1],
						camera.angle.map((angle) => `0.18 1 -0.12 ${angle}deg`),
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.linear,
						},
					),
				}}
				effects={[
					radialProgressiveBlur({
						center: [focusX / 5120, focusY / 1964],
						width: focus.width,
						height: focus.height,
						start: focus.start,
						startBlur: focus.centerBlur,
						endBlur: interpolate(
							frame,
							[0, (durationInFrames - 1) / 2, durationInFrames - 1],
							focus.outerBlur,
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.inOut(Easing.sin),
							},
						),
					}),
					vignette({
						center: [focusX / 5120, focusY / 1964],
						...focus.vignette,
						roundness: 1,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

const AuraTimeline = Interactive.create({
	Component: TimelineCamera,
	layout: 'absolute-fill',
	schema: {
		view: {
			type: 'enum',
			default: 'chapters',
			description: 'Captured timeline',
			variants: {chapters: {}, styles: {}, selection: {}, captions: {}},
		},
	},
});

export const AuraCodeAndTimeline = () => {
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill style={{backgroundColor: '#131414'}}>
			<TransitionSeries name="Code and its real Studio timeline">
				<TransitionSeries.Sequence
					name="01 · Chapters"
					durationInFrames={2 * fps}
				>
					<Sequence name="Code" width={1920} height={1080}>
						<AuraCodeChapters />
					</Sequence>
					<Sequence
						name="Timeline"
						width={1920}
						height={1080}
						style={{left: 1920}}
					>
						<AuraTimeline view="chapters" />
					</Sequence>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={0.2 * fps}>
					<AuraCodeFlash name="Black flash into HTML and CSS" />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="02 · HTML and CSS"
					durationInFrames={2 * fps}
				>
					<Sequence name="Code" width={1920} height={1080}>
						<AuraCodeStyles />
					</Sequence>
					<Sequence
						name="Timeline"
						width={1920}
						height={1080}
						style={{left: 1920}}
					>
						<AuraTimeline view="styles" />
					</Sequence>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={0.2 * fps}>
					<AuraCodeFlash name="Black flash into selection" />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="03 · Select a chapter"
					durationInFrames={1.4 * fps}
				>
					<Sequence name="Code" width={1920} height={1080}>
						<AuraCodeDuplicate />
					</Sequence>
					<Sequence
						name="Timeline"
						width={1920}
						height={1080}
						style={{left: 1920}}
					>
						<AuraTimeline view="selection" />
					</Sequence>
				</TransitionSeries.Sequence>
				<TransitionSeries.Overlay durationInFrames={0.2 * fps}>
					<AuraCodeFlash name="Black flash into captions" />
				</TransitionSeries.Overlay>
				<TransitionSeries.Sequence
					name="04 · Captions"
					durationInFrames={2 * fps}
				>
					<Sequence name="Code" width={1920} height={1080}>
						<AuraCodeCaptions />
					</Sequence>
					<Sequence
						name="Timeline"
						width={1920}
						height={1080}
						style={{left: 1920}}
					>
						<AuraTimeline view="captions" />
					</Sequence>
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<div
				style={{
					position: 'absolute',
					left: 1918,
					width: 4,
					height: '100%',
					background: '#080a0c',
				}}
			/>
		</AbsoluteFill>
	);
};

import {evolve} from '@remotion/effects/evolve';
import {fisheye} from '@remotion/effects/fisheye';
import {glow} from '@remotion/effects/glow';
import {gridlines} from '@remotion/effects/gridlines';
import {halftoneLinearGradient} from '@remotion/effects/halftone-linear-gradient';
import {scale} from '@remotion/effects/scale';
import {loadFont} from '@remotion/fonts';
import React from 'react';
import {
	Easing,
	HtmlInCanvas,
	interpolate,
	Solid,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {metallicSwirl} from './metallic-swirl-effect';

const fontFamily = 'GTPlanar';
const ANIMATION_DURATION_FRAMES = 15;

loadFont({
	family: fontFamily,
	url: staticFile('GT Planar/GT-Planar-Bold.woff2'),
	weight: '700',
});

const textStyle: React.CSSProperties = {
	fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
	fontSize: 360,
	fontWeight: 700,
	lineHeight: 1,
	letterSpacing: '-0.05em',
	color: 'white',
};

const subtitleStyle: React.CSSProperties = {
	fontFamily: `${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
	fontSize: 48,
	fontWeight: 700,
	lineHeight: 1,
	letterSpacing: '0.12em',
	color: 'white',
	textTransform: 'uppercase',
	fontFeatureSettings: "'ss03' 1",
};

export const Goal: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const progress = interpolate(frame, [0, ANIMATION_DURATION_FRAMES], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});

	const gap = interpolate(progress, [0, 1], [480, 0]);
	const goSkew = interpolate(progress, [0, 1], [-22, 0]);
	const alSkew = interpolate(progress, [0, 1], [22, 0]);
	const goOffset = interpolate(progress, [0, 1], [-140, 0]);
	const alOffset = interpolate(progress, [0, 1], [140, 0]);

	return (
		<>
			<Solid
				width={1280}
				height={720}
				style={{
					position: 'absolute',
				}}
				color={'#181818'}
			/>
			<Solid
				width={1280}
				height={720}
				style={{
					position: 'absolute',
				}}
				color={'rgba(24, 24, 24, 0)'}
				effects={[
					gridlines({
						lineColor: 'rgba(255, 255, 255, 0.07)',
						rotationX: -4,
						perspective: 23,
						offsetY: interpolate(frame, [0, 78], [14.2, -182.3], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}),
					evolve({
						feather: 0,
						direction: 'bottom',
						progress: 0.86,
					}),
					scale({
						scale: 1.4,
					}),
				]}
			/>
			<HtmlInCanvas
				width={1280}
				height={720}
				pixelDensity={1.5}
				effects={[
					metallicSwirl({
						time: frame / fps,
						mode: 'alpha-mask',
						speed: 0,
						zoom: 5.4,
						brightness: 2.56,
						colorRange: 1.05,
						colorBias: 0.8,
						colorA: '#662f2f',
						colorB: '#00ffc9',
						backgroundColor: '#000000',
						colorPhaseR: 3.21,
						colorPhaseG: -5.03,
						tangentForce: 1.43,
						sampleGap: 0.219,
						gradientForce: 0.34,
					}),
					fisheye({
						fieldOfView: interpolate(frame, [11, 43], [1.67, 2.33], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 10,
									mass: 1,
									stiffness: 269,
									overshootClamping: false,
								}),
							],
						}),
						radius: interpolate(frame, [11, 43], [1.98, 0.79], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 10,
									mass: 1,
									stiffness: 100,
									overshootClamping: false,
								}),
							],
						}),
						zoom: 1.09,
					}),
					glow({
						intensity: interpolate(frame, [11, 43], [0, 1.5], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 5,
									mass: 1,
									stiffness: 120,
									overshootClamping: false,
								}),
							],
						}),

						radius: interpolate(frame, [11, 43], [0, 53], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 5,
									mass: 1,
									stiffness: 120,
									overshootClamping: false,
								}),
							],
						}),

						threshold: 0.24,
						disabled: true,
					}),
				]}
				style={{
					scale: interpolate(frame, [17, 52], [1, 0.67], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: [
							Easing.spring({
								damping: 5,
								mass: 1,
								stiffness: 63,
								overshootClamping: false,
							}),
						],
					}),
					translate: '0px -66.4px',
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<div
							style={{
								...textStyle,
								transform: `skewX(${goSkew}deg) translateX(${goOffset}px)`,
							}}
						>
							GO
						</div>
						<div style={{width: gap}} />
						<div
							style={{
								...textStyle,
								transform: `skewX(${alSkew}deg) translateX(${alOffset}px)`,
							}}
						>
							AL
						</div>
					</div>
				</div>
			</HtmlInCanvas>
			<HtmlInCanvas
				width={1280}
				height={720}
				pixelDensity={2}
				style={{
					translate: '0px -609.5px',
					opacity: interpolate(frame, [24, 27], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					scale: interpolate(frame, [24, 27], [0.87, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
				from={-1}
				effects={[
					halftoneLinearGradient({
						maskToSourceAlpha: true,
						colorMode: 'source',
						gridSize: 4,
						secondStopDotSize: 5,
						secondStopPosition: [0.706, 0.628],
						firstStopPosition: [-0.135, 0.787],
					}),
				]}
			>
				<div
					style={{
						...subtitleStyle,
						position: 'absolute',
						left: 0,
						right: 0,
						top: 430,
						textAlign: 'center',
					}}
				>
					{"27'    COMENENCIA"}
				</div>
			</HtmlInCanvas>
		</>
	);
};

import {lensBlur, type LensBlurParams} from '@remotion/effects/lens-blur';
import {Video} from '@remotion/media';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	HtmlInCanvas,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {useHtmlInCanvasDocsDemoBranch} from '../demos/useHtmlInCanvasDocsDemoBranch';
import {EFFECTS_PREVIEW_IMAGE_SRC} from './effects-preview-image';

export const EffectsLensBlurPreview: React.FC<Required<LensBlurParams>> = ({
	radius,
	irisShape,
	irisRoundness,
	irisRotation,
	irisAspectRatio,
	highlightGain,
	highlightThreshold,
	highlightSaturation,
	repeatEdgePixels,
	samples,
	linearLight,
}) => {
	return (
		<CanvasImage
			name="Lens blur preview"
			src={EFFECTS_PREVIEW_IMAGE_SRC}
			width={1280}
			height={720}
			fit="cover"
			effects={[
				lensBlur({
					radius,
					irisShape,
					irisRoundness,
					irisRotation,
					irisAspectRatio,
					highlightGain,
					highlightThreshold,
					highlightSaturation,
					repeatEdgePixels,
					samples,
					linearLight,
				}),
			]}
		/>
	);
};

const LensBlurScene: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<HtmlInCanvas
				name="Focus pull"
				width={1280}
				height={720}
				effects={[
					lensBlur({
						radius: interpolate(frame, [0, 40, 80, 120], [40, 0, 0, 40], {
							easing: Easing.bezier(0.42, 0, 0.58, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						irisShape: 'hexagon',
						samples: 512,
					}),
				]}
			>
				<Interactive.Div
					name="Focus text"
					style={{
						width: '100%',
						height: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: 'Arial, Helvetica, sans-serif',
						fontSize: 180,
						fontWeight: 900,
						lineHeight: 1,
						color: 'white',
					}}
				>
					FOCUS
				</Interactive.Div>
			</HtmlInCanvas>
		</AbsoluteFill>
	);
};

export const LensBlurDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch('webgl2');
	if (branch === 'pending')
		return <AbsoluteFill style={{backgroundColor: 'black'}} />;
	if (branch === 'live') return <LensBlurScene />;
	return (
		<Video
			name="Lens blur video preview"
			muted
			src="https://remotion.media/lens-blur-demo-b127a7f41f9d.mp4"
			style={{width: '100%', height: '100%'}}
		/>
	);
};

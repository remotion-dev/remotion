import {tint} from '@remotion/effects/tint';
import {Gif} from '@remotion/gif';
import {
	CameraMotionBlur,
	HtmlInCanvasMotionBlur,
	Trail,
} from '@remotion/motion-blur';
import React from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	Interactive,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {z} from 'zod';

export const bouncingImagesMotionBlurSchema = z.object({
	blur: z.enum(['HtmlInCanvasMotionBlur', 'CameraMotionBlur', 'Trail', 'None']),
	samples: z.number().int().min(1).max(64),
	shutterAngle: z.number().min(0).max(360),
	trailLagInFrames: z.number().min(0).max(4),
	effects: z.boolean(),
});

const BouncingImages: React.FC<{effects: boolean}> = ({effects}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const horizontalRange = width / 2 - 284;
	const verticalRange = height - 400;
	const horizontalTravel = (frame / fps) * 600 + 50;
	const verticalTravel = (frame / fps) * 410 + 60;
	const x =
		horizontalRange -
		Math.abs(
			Math.abs(horizontalTravel % (2 * horizontalRange)) - horizontalRange,
		);
	const y =
		verticalRange -
		Math.abs(Math.abs(verticalTravel % (2 * verticalRange)) - verticalRange);

	return (
		<>
			<Gif
				name="Bouncing GIF"
				src={staticFile('giphy.gif')}
				loop
				width={220}
				height={220}
				fit="contain"
				effects={effects ? [tint({color: '#f97316', amount: 0.6})] : []}
				style={{
					position: 'absolute',
					left: 32,
					top: 136,
					translate: `${x}px ${y}px`,
				}}
			/>
			<AnimatedImage
				name="Bouncing animated image"
				src={staticFile('giphy.gif')}
				loop
				width={220}
				height={220}
				fit="contain"
				effects={effects ? [tint({color: '#38bdf8', amount: 0.6})] : []}
				style={{
					position: 'absolute',
					left: 'calc(50% + 32px)',
					top: 136,
					translate: `${x}px ${y}px`,
				}}
			/>
		</>
	);
};

export const BouncingImagesMotionBlur: React.FC<
	z.infer<typeof bouncingImagesMotionBlurSchema>
> = ({blur, samples, shutterAngle, trailLagInFrames, effects}) => {
	const {width, height} = useVideoConfig();
	const images = <BouncingImages effects={effects} />;
	let content: React.ReactNode = images;

	if (blur === 'HtmlInCanvasMotionBlur') {
		content = (
			<HtmlInCanvasMotionBlur
				name="Image motion blur"
				width={width}
				height={height}
				samples={samples}
				shutterAngle={shutterAngle}
				disabledInPreview={false}
			>
				{images}
			</HtmlInCanvasMotionBlur>
		);
	} else if (blur === 'CameraMotionBlur') {
		content = (
			<CameraMotionBlur samples={samples} shutterAngle={shutterAngle}>
				{images}
			</CameraMotionBlur>
		);
	} else if (blur === 'Trail') {
		content = (
			<Trail layers={samples} lagInFrames={trailLagInFrames} trailOpacity={0.6}>
				{images}
			</Trail>
		);
	}

	return (
		<AbsoluteFill style={{backgroundColor: '#101318', color: '#f1f5f9'}}>
			<div
				style={{
					position: 'absolute',
					left: 16,
					top: 112,
					bottom: 16,
					width: 'calc(50% - 32px)',
					border: '1px solid #374151',
					borderRadius: 12,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 'calc(50% + 16px)',
					top: 112,
					bottom: 16,
					width: 'calc(50% - 32px)',
					border: '1px solid #374151',
					borderRadius: 12,
				}}
			/>
			{content}
			<Interactive.Div
				name="GIF label"
				style={{
					position: 'absolute',
					left: 32,
					top: 36,
					fontFamily: 'Inter, sans-serif',
					fontSize: 36,
					fontWeight: 600,
				}}
			>
				&lt;Gif&gt;
			</Interactive.Div>
			<Interactive.Div
				name="Animated image label"
				style={{
					position: 'absolute',
					left: 'calc(50% + 32px)',
					top: 36,
					fontFamily: 'Inter, sans-serif',
					fontSize: 36,
					fontWeight: 600,
				}}
			>
				&lt;AnimatedImage&gt;
			</Interactive.Div>
		</AbsoluteFill>
	);
};

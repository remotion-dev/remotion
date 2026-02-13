import {useThree} from '@react-three/fiber';
import {Video} from '@remotion/media';
import {ThreeCanvas} from '@remotion/three';
import React, {useCallback, useState} from 'react';
import {useRemotionEnvironment, useVideoConfig} from 'remotion';
import {CanvasTexture} from 'three';

const videoSrc = 'https://remotion.media/video.mp4';

const videoWidth = 1920;
const videoHeight = 1080;
const aspectRatio = videoWidth / videoHeight;
const scale = 3;
const planeHeight = scale;
const planeWidth = aspectRatio * scale;

const Inner: React.FC = () => {
	const [canvasStuff] = useState(() => {
		const canvas = new OffscreenCanvas(videoWidth, videoHeight);
		const context = canvas.getContext('2d')!;
		const texture = new CanvasTexture(canvas);
		return {canvas, context, texture};
	});

	const {invalidate, advance} = useThree();
	const {isRendering} = useRemotionEnvironment();

	const onVideoFrame = useCallback(
		(frame: CanvasImageSource) => {
			canvasStuff.context.drawImage(frame, 0, 0, videoWidth, videoHeight);
			canvasStuff.texture.needsUpdate = true;
			if (isRendering) {
				// ThreeCanvas's ManualFrameRenderer already calls advance() in a
				// useEffect on frame change, but video frame extraction is async
				// (BroadcastChannel round-trip) and resolves after that useEffect.
				// So by the time onVideoFrame fires, the scene was already rendered
				// with the stale texture. We need a second advance() here to
				// re-render the scene now that the texture is actually updated.
				advance(performance.now());
			} else {
				// During preview with the default frameloop='always', the texture
				// is picked up automatically. This is only needed if
				// frameloop='demand' is passed to <ThreeCanvas>.
				invalidate();
			}
		},
		[
			canvasStuff.context,
			canvasStuff.texture,
			invalidate,
			advance,
			isRendering,
		],
	);

	return (
		<>
			<Video src={videoSrc} onVideoFrame={onVideoFrame} muted headless />
			<mesh>
				<planeGeometry args={[planeWidth, planeHeight]} />
				<meshBasicMaterial
					color={0xffffff}
					toneMapped={false}
					map={canvasStuff.texture}
				/>
			</mesh>
		</>
	);
};

export const RemotionMediaVideoTexture: React.FC = () => {
	const {width, height} = useVideoConfig();

	return (
		<ThreeCanvas
			style={{backgroundColor: 'white'}}
			linear
			width={width}
			height={height}
		>
			<Inner />
		</ThreeCanvas>
	);
};

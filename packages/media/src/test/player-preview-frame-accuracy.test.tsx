import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {test} from 'vitest';
import {Video} from '../video/video';
import {
	canvasToBlob,
	findLargestCanvas,
	testImage,
	waitFor,
} from './player-frame-accuracy-utils';

const fps = 30;
const width = 1920;
const height = 1080;
const startFrame = 45;
const framesToStepThrough = [46, 47, 48];
const stepBackFrame = 47;
const finalFrame = 48;
const afterSteppingScreenshot = 'media-player-frame-48-accuracy-after-stepping';
const afterStepBackAndForwardScreenshot =
	'media-player-frame-48-accuracy-after-step-back-and-forward';
// Allow tiny browser/decoder screenshot variance after seeks while still catching visible frame offsets.
const allowedMismatchedPixelRatio = 0.001;

test('keeps preview frame stepping visually accurate in Player', async () => {
	const response = await fetch('https://remotion.media/video.mp4');
	if (!response.ok) {
		throw new Error(
			`Could not load frame accuracy fixture: ${response.status}`,
		);
	}

	// Finish downloading before testing playback and seeks.
	const src = URL.createObjectURL(await response.blob());
	let timeline: React.ContextType<typeof Internals.SetTimelineContext> | null =
		null;
	let drawnFrames = 0;
	const onVideoFrame = () => {
		drawnFrames++;
	};

	const VideoComposition = () => {
		timeline = React.useContext(Internals.SetTimelineContext);
		return (
			<Video
				src={src}
				onVideoFrame={onVideoFrame}
				disallowFallbackToOffthreadVideo
			/>
		);
	};

	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	const seekToAndWaitForDraw = async (frame: number) => {
		const previousDrawnFrames = drawnFrames;
		flushSync(() => playerRef.current!.seekTo(frame));
		// The timeline updates before decoding finishes, and effects may redraw
		// the previous frame while the requested frame is still buffering.
		await waitFor(
			() =>
				playerRef.current!.getCurrentFrame() === frame &&
				drawnFrames > previousDrawnFrames &&
				!timeline!.isBuffering(),
		);
	};

	root.render(
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={VideoComposition}
			compositionHeight={height}
			compositionWidth={width}
			durationInFrames={300}
			fps={fps}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(
			() =>
				playerRef.current !== null &&
				drawnFrames > 0 &&
				timeline !== null &&
				!timeline.isBuffering(),
		);

		const beforePlayback = drawnFrames;
		playerRef.current!.play();
		await waitFor(
			() =>
				playerRef.current!.getCurrentFrame() >= 10 &&
				drawnFrames > beforePlayback,
		);
		playerRef.current!.pause();

		await seekToAndWaitForDraw(startFrame);

		for (const frame of framesToStepThrough) {
			await seekToAndWaitForDraw(frame);
		}

		const afterSteppingBlob = await canvasToBlob(findLargestCanvas(container));
		await testImage({
			allowedMismatchedPixelRatio,
			blob: afterSteppingBlob,
			testId: afterSteppingScreenshot,
		});

		await seekToAndWaitForDraw(stepBackFrame);

		await seekToAndWaitForDraw(finalFrame);

		const afterStepBackAndForwardBlob = await canvasToBlob(
			findLargestCanvas(container),
		);
		await testImage({
			allowedMismatchedPixelRatio,
			blob: afterStepBackAndForwardBlob,
			testId: afterStepBackAndForwardScreenshot,
		});
	} finally {
		root.unmount();
		container.remove();
		URL.revokeObjectURL(src);
	}
}, 30000);

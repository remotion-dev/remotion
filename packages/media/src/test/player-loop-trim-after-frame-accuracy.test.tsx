import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {test} from 'vitest';
import {Video} from '../video/video';
import {
	canvasToBlob,
	findLargestCanvas,
	testImage,
	wait,
	waitFor,
	waitUntilCanvasIsVisible,
} from './player-frame-accuracy-utils';

const src = 'https://remotion.media/video-1m.mp4';
const fps = 30;
const width = 1920;
const height = 1080;
const trimBefore = 90;
const trimAfter = 60 * fps;
const loopDuration = trimAfter - trimBefore;
const startFrame = loopDuration - 1;
const framesToStepForwardThrough = [1710, 1711, 1712, 1713, 1714];
const framesToStepBackThrough = [1713, 1712, 1711];
const finalScreenshot =
	'media-player-frame-1711-video-frame-91-loop-trim-after-step-back';

const VideoComposition: React.FC<{onVideoFrame: () => void}> = ({
	onVideoFrame,
}) => {
	return (
		<Video
			src={src}
			trimBefore={trimBefore}
			trimAfter={trimAfter}
			loop
			onVideoFrame={onVideoFrame}
		/>
	);
};

const TestPlayer: React.FC<{
	onVideoFrame: () => void;
	playerRef: React.RefObject<PlayerRef | null>;
}> = ({onVideoFrame, playerRef}) => {
	return (
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={VideoComposition}
			compositionHeight={height}
			compositionWidth={width}
			durationInFrames={loopDuration * 3}
			fps={fps}
			initiallyMuted
			inputProps={{onVideoFrame}}
		/>
	);
};

const seekToAndWaitForVideoFrame = async ({
	frame,
	getDrawnFrames,
	playerRef,
	settleTime,
}: {
	frame: number;
	getDrawnFrames: () => number;
	playerRef: React.RefObject<PlayerRef | null>;
	settleTime: number;
}) => {
	const drawnFrames = getDrawnFrames();
	playerRef.current!.seekTo(frame);
	await waitFor(() => playerRef.current!.getCurrentFrame() === frame);
	await waitFor(() => getDrawnFrames() > drawnFrames);
	await wait(settleTime);
};

test('keeps preview frame stepping accurate after crossing a trimAfter loop boundary', async () => {
	let drawnFrames = 0;
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(
		<TestPlayer
			playerRef={playerRef}
			onVideoFrame={() => {
				drawnFrames++;
			}}
		/>,
	);

	try {
		await waitFor(() => playerRef.current !== null);
		await waitUntilCanvasIsVisible({container, height, width});

		await seekToAndWaitForVideoFrame({
			playerRef,
			frame: startFrame,
			getDrawnFrames: () => drawnFrames,
			settleTime: 500,
		});

		for (const frame of framesToStepForwardThrough) {
			await seekToAndWaitForVideoFrame({
				playerRef,
				frame,
				getDrawnFrames: () => drawnFrames,
				settleTime: 100,
			});
		}

		for (const frame of framesToStepBackThrough) {
			await seekToAndWaitForVideoFrame({
				playerRef,
				frame,
				getDrawnFrames: () => drawnFrames,
				settleTime: 100,
			});
		}

		const blob = await canvasToBlob(findLargestCanvas(container));
		await testImage({
			allowedMismatchedPixelRatio: 0.001,
			blob,
			testId: finalScreenshot,
		});
	} finally {
		root.unmount();
		container.remove();
	}
});

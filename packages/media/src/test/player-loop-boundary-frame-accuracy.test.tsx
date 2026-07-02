import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Loop} from 'remotion';
import {test} from 'vitest';
import {Video} from '../video/video';
import {
	canvasToBlob,
	findLargestCanvas,
	seekToAndWait,
	testImage,
	wait,
	waitFor,
	waitUntilCanvasIsVisible,
} from './player-frame-accuracy-utils';

const src = 'https://remotion.media/video.mp4';
const fps = 30;
const width = 1920;
const height = 1080;
const loopDurationInFrames = 90;
const firstFrameAfterBoundary = 93;
const framesToStepBackThrough = [92, 91];
const boundaryFrame = 90;
const beforeBoundaryFrame = 89;
const boundaryFrameScreenshot =
	'media-player-frame-90-video-frame-0-loop-boundary-step-back';
const beforeBoundaryFrameScreenshot =
	'media-player-frame-89-video-frame-89-loop-boundary-step-back';

const VideoComposition: React.FC = () => {
	return (
		<Loop durationInFrames={loopDurationInFrames} times={3} name="MediaLoop">
			<Video src={src} debugOverlay />
		</Loop>
	);
};

const TestPlayer: React.FC<{playerRef: React.RefObject<PlayerRef | null>}> = ({
	playerRef,
}) => {
	return (
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={VideoComposition}
			compositionHeight={height}
			compositionWidth={width}
			durationInFrames={loopDurationInFrames * 3}
			fps={fps}
			initiallyMuted
			inputProps={{}}
		/>
	);
};

test('keeps preview frame stepping visually accurate when stepping back over a loop boundary', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(<TestPlayer playerRef={playerRef} />);

	try {
		await waitFor(() => playerRef.current !== null);
		await waitUntilCanvasIsVisible({container, height, width});

		playerRef.current!.play();
		await waitFor(
			() => playerRef.current!.getCurrentFrame() >= firstFrameAfterBoundary,
		);
		await wait(250);
		playerRef.current!.pause();
		await wait(250);

		for (const frame of framesToStepBackThrough) {
			await seekToAndWait({playerRef, frame, settleTime: 500});
		}

		await seekToAndWait({playerRef, frame: boundaryFrame, settleTime: 500});
		const boundaryFrameBlob = await canvasToBlob(findLargestCanvas(container));
		await testImage({
			allowedMismatchedPixelRatio: 0.001,
			blob: boundaryFrameBlob,
			testId: boundaryFrameScreenshot,
		});

		await seekToAndWait({
			playerRef,
			frame: beforeBoundaryFrame,
			settleTime: 500,
		});
		const beforeBoundaryFrameBlob = await canvasToBlob(
			findLargestCanvas(container),
		);
		await testImage({
			allowedMismatchedPixelRatio: 0.001,
			blob: beforeBoundaryFrameBlob,
			testId: beforeBoundaryFrameScreenshot,
		});
	} finally {
		root.unmount();
		container.remove();
	}
});

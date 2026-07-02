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

const fps = 30;
const width = 1920;
const height = 1080;

const loopBoundarySrc = 'https://remotion.media/video.mp4';
const loopBoundaryDurationInFrames = 90;
const firstFrameAfterBoundary = 93;
const framesToStepBackThroughBoundary = [92, 91];
const boundaryFrame = 90;
const beforeBoundaryFrame = 89;
const boundaryFrameScreenshot =
	'media-player-frame-90-video-frame-0-loop-boundary-step-back';
const beforeBoundaryFrameScreenshot =
	'media-player-frame-89-video-frame-89-loop-boundary-step-back';

const trimAfterLoopSrc = 'https://remotion.media/video-1m.mp4';
const trimBefore = 90;
const trimAfter = 60 * fps;
const trimAfterLoopDuration = trimAfter - trimBefore;
const trimAfterLoopStartFrame = trimAfterLoopDuration - 1;
const framesToStepForwardThroughTrimAfterLoop = [1710, 1711, 1712, 1713, 1714];
const framesToStepBackThroughTrimAfterLoop = [1713, 1712, 1711];
const trimAfterLoopFinalScreenshot =
	'media-player-frame-1711-video-frame-91-loop-trim-after-step-back';

const LoopBoundaryVideoComposition: React.FC = () => {
	return (
		<Loop
			durationInFrames={loopBoundaryDurationInFrames}
			times={3}
			name="MediaLoop"
		>
			<Video src={loopBoundarySrc} debugOverlay />
		</Loop>
	);
};

const LoopBoundaryTestPlayer: React.FC<{
	readonly playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	return (
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={LoopBoundaryVideoComposition}
			compositionHeight={height}
			compositionWidth={width}
			durationInFrames={loopBoundaryDurationInFrames * 3}
			fps={fps}
			initiallyMuted
			inputProps={{}}
		/>
	);
};

const TrimAfterLoopVideoComposition: React.FC<{
	readonly onVideoFrame: () => void;
}> = ({onVideoFrame}) => {
	return (
		<Video
			src={trimAfterLoopSrc}
			trimBefore={trimBefore}
			trimAfter={trimAfter}
			loop
			onVideoFrame={onVideoFrame}
		/>
	);
};

const TrimAfterLoopTestPlayer: React.FC<{
	readonly onVideoFrame: () => void;
	readonly playerRef: React.RefObject<PlayerRef | null>;
}> = ({onVideoFrame, playerRef}) => {
	return (
		<Player
			ref={playerRef}
			acknowledgeRemotionLicense
			component={TrimAfterLoopVideoComposition}
			compositionHeight={height}
			compositionWidth={width}
			durationInFrames={trimAfterLoopDuration * 3}
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

test('keeps preview frame stepping visually accurate when stepping back over a loop boundary', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(<LoopBoundaryTestPlayer playerRef={playerRef} />);

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

		for (const frame of framesToStepBackThroughBoundary) {
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

test('keeps preview frame stepping accurate after crossing a trimAfter loop boundary', async () => {
	let drawnFrames = 0;
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(
		<TrimAfterLoopTestPlayer
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
			frame: trimAfterLoopStartFrame,
			getDrawnFrames: () => drawnFrames,
			settleTime: 500,
		});

		for (const frame of framesToStepForwardThroughTrimAfterLoop) {
			await seekToAndWaitForVideoFrame({
				playerRef,
				frame,
				getDrawnFrames: () => drawnFrames,
				settleTime: 100,
			});
		}

		for (const frame of framesToStepBackThroughTrimAfterLoop) {
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
			testId: trimAfterLoopFinalScreenshot,
		});
	} finally {
		root.unmount();
		container.remove();
	}
});

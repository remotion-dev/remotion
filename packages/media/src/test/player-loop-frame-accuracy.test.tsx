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

const fps = 30;
const width = 1920;
const height = 1080;

const seekToAndWaitForVideoFrame = async ({
	frame,
	getDrawnFrames,
	playerRef,
	settleTime,
}: {
	readonly frame: number;
	readonly getDrawnFrames: () => number;
	readonly playerRef: React.RefObject<PlayerRef | null>;
	readonly settleTime: number;
}) => {
	const drawnFrames = getDrawnFrames();
	playerRef.current!.seekTo(frame);
	await waitFor(() => playerRef.current!.getCurrentFrame() === frame);
	await waitFor(() => getDrawnFrames() > drawnFrames);
	await wait(settleTime);
};

test('keeps preview frame stepping accurate after crossing a trimAfter loop boundary', async () => {
	const VideoComposition: React.FC<{
		readonly onVideoFrame: () => void;
	}> = ({onVideoFrame}) => {
		return (
			<Video
				src="https://remotion.media/video-1m.mp4"
				trimBefore={90}
				trimAfter={60 * fps}
				loop
				onVideoFrame={onVideoFrame}
			/>
		);
	};

	const TestPlayer: React.FC<{
		readonly onVideoFrame: () => void;
		readonly playerRef: React.RefObject<PlayerRef | null>;
	}> = ({onVideoFrame, playerRef: ref}) => {
		return (
			<Player
				ref={ref}
				acknowledgeRemotionLicense
				component={VideoComposition}
				compositionHeight={height}
				compositionWidth={width}
				durationInFrames={(60 * fps - 90) * 3}
				fps={fps}
				initiallyMuted
				inputProps={{onVideoFrame}}
			/>
		);
	};

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
			frame: 60 * fps - 90 - 1,
			getDrawnFrames: () => drawnFrames,
			settleTime: 500,
		});

		for (const frame of [1710, 1711, 1712, 1713, 1714]) {
			await seekToAndWaitForVideoFrame({
				playerRef,
				frame,
				getDrawnFrames: () => drawnFrames,
				settleTime: 100,
			});
		}

		for (const frame of [1713, 1712, 1711]) {
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
			testId:
				'media-player-frame-1711-video-frame-91-loop-trim-after-step-back',
		});
	} finally {
		root.unmount();
		container.remove();
	}
});

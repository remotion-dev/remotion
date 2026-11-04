import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
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
	isBuffering,
	playerRef,
	settleTime,
}: {
	readonly frame: number;
	readonly getDrawnFrames: () => number;
	readonly isBuffering: () => boolean;
	readonly playerRef: React.RefObject<PlayerRef | null>;
	readonly settleTime: number;
}) => {
	const drawnFrames = getDrawnFrames();
	playerRef.current!.seekTo(frame);
	await waitFor(() => playerRef.current!.getCurrentFrame() === frame);
	// An effects redraw can report the preceding frame while the seek still buffers.
	await waitFor(() => getDrawnFrames() > drawnFrames && !isBuffering());
	await wait(settleTime);
};

test('keeps preview frame stepping accurate after crossing a trimAfter loop boundary', async () => {
	let timeline: React.ContextType<typeof Internals.SetTimelineContext> | null =
		null;
	const VideoComposition: React.FC<{
		readonly onVideoFrame: () => void;
	}> = ({onVideoFrame}) => {
		timeline = React.useContext(Internals.SetTimelineContext);
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
			isBuffering: () => timeline!.isBuffering(),
			settleTime: 500,
		});

		for (const frame of [1710, 1711, 1712, 1713, 1714]) {
			await seekToAndWaitForVideoFrame({
				playerRef,
				frame,
				getDrawnFrames: () => drawnFrames,
				isBuffering: () => timeline!.isBuffering(),
				settleTime: 100,
			});
		}

		for (const frame of [1713, 1712, 1711]) {
			await seekToAndWaitForVideoFrame({
				playerRef,
				frame,
				getDrawnFrames: () => drawnFrames,
				isBuffering: () => timeline!.isBuffering(),
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

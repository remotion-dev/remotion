import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {test} from 'vitest';
import {Video} from '../video/video';
import {
	canvasToBlob,
	findLargestCanvas,
	seekToAndWait,
	testImage,
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

const VideoComposition: React.FC = () => {
	return <Video src={src} trimBefore={trimBefore} trimAfter={trimAfter} loop />;
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
			durationInFrames={loopDuration * 3}
			fps={fps}
			initiallyMuted
			inputProps={{}}
		/>
	);
};

test('keeps preview frame stepping accurate after crossing a trimAfter loop boundary', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(<TestPlayer playerRef={playerRef} />);

	try {
		await waitFor(() => playerRef.current !== null);
		await waitUntilCanvasIsVisible({container, height, width});

		await seekToAndWait({playerRef, frame: startFrame, settleTime: 500});

		for (const frame of framesToStepForwardThrough) {
			await seekToAndWait({playerRef, frame, settleTime: 100});
		}

		for (const frame of framesToStepBackThrough) {
			await seekToAndWait({playerRef, frame, settleTime: 100});
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

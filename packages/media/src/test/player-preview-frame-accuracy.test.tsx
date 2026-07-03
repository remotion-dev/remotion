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
	wait,
	waitFor,
	waitUntilCanvasIsVisible,
} from './player-frame-accuracy-utils';

const src = 'https://remotion.media/video.mp4';
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

const VideoComposition: React.FC = () => {
	return <Video src={src} debugOverlay />;
};

const TestPlayer: React.FC<{
	readonly playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	return (
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
		/>
	);
};

test('keeps preview frame stepping visually accurate in Player', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(<TestPlayer playerRef={playerRef} />);

	try {
		await waitFor(() => playerRef.current !== null);
		await waitUntilCanvasIsVisible({container, height, width});

		playerRef.current!.play();
		await wait(700);
		playerRef.current!.pause();
		await wait(250);

		await seekToAndWait({playerRef, frame: startFrame, settleTime: 500});

		for (const frame of framesToStepThrough) {
			await seekToAndWait({playerRef, frame, settleTime: 500});
		}

		playerRef.current!.pause();
		const afterSteppingBlob = await canvasToBlob(findLargestCanvas(container));
		await testImage({
			allowedMismatchedPixelRatio,
			blob: afterSteppingBlob,
			testId: afterSteppingScreenshot,
		});

		await seekToAndWait({playerRef, frame: stepBackFrame, settleTime: 500});

		await seekToAndWait({playerRef, frame: finalFrame, settleTime: 500});

		playerRef.current!.pause();
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
	}
});

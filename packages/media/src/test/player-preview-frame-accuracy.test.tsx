import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {expect, onTestFinished, test} from 'vitest';
import {page} from 'vitest/browser';
import {Video} from '../video/video';

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

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 15000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	throw new Error('Timed out waiting for condition');
};

const wait = (duration: number) => {
	return new Promise((resolve) => setTimeout(resolve, duration));
};

const VideoComposition: React.FC = () => {
	return <Video src={src} debugOverlay />;
};

const findLargestCanvas = (container: HTMLElement): HTMLCanvasElement => {
	const canvases = [...container.querySelectorAll('canvas')];
	if (canvases.length === 0) {
		throw new Error('No canvas found');
	}

	return canvases.sort((a, b) => b.width * b.height - a.width * a.height)[0];
};

const canvasToBlob = async (canvas: HTMLCanvasElement) => {
	const preview = document.createElement('canvas');
	preview.width = 360;
	preview.height = 202;

	const context = preview.getContext('2d');
	if (!context) {
		throw new Error('Could not get preview canvas context');
	}

	context.drawImage(canvas, 0, 0, preview.width, preview.height);

	const blob = await new Promise<Blob | null>((resolve) => {
		preview.toBlob(resolve, 'image/png');
	});

	if (!blob) {
		throw new Error('Could not serialize canvas');
	}

	return blob;
};

const testImage = async ({blob, testId}: {blob: Blob; testId: string}) => {
	const img = document.createElement('img');
	img.src = URL.createObjectURL(blob);
	img.dataset.testid = testId;
	img.style.display = 'block';
	img.style.width = '360px';
	img.style.height = '202px';
	document.body.appendChild(img);

	onTestFinished(() => {
		document.body.removeChild(img);
		URL.revokeObjectURL(img.src);
	});

	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error('Image failed to load'));
	});

	await expect(page.getByTestId(testId)).toMatchScreenshot(testId, {
		comparatorOptions: {
			threshold: 0,
			allowedMismatchedPixelRatio: 0,
		},
	});
};

const waitUntilCanvasIsVisible = async (container: HTMLElement) => {
	await waitFor(() => {
		const canvas = findLargestCanvas(container);
		return canvas.width === width && canvas.height === height;
	});
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
		await waitUntilCanvasIsVisible(container);

		playerRef.current!.play();
		await wait(700);
		playerRef.current!.pause();
		await wait(250);

		playerRef.current!.seekTo(startFrame);
		await waitFor(() => playerRef.current!.getCurrentFrame() === startFrame);
		await wait(500);

		for (const frame of framesToStepThrough) {
			playerRef.current!.seekTo(frame);
			await waitFor(() => playerRef.current!.getCurrentFrame() === frame);
			await wait(500);
		}

		playerRef.current!.pause();
		const afterSteppingBlob = await canvasToBlob(findLargestCanvas(container));
		await testImage({
			blob: afterSteppingBlob,
			testId: afterSteppingScreenshot,
		});

		playerRef.current!.seekTo(stepBackFrame);
		await waitFor(() => playerRef.current!.getCurrentFrame() === stepBackFrame);
		await wait(500);

		playerRef.current!.seekTo(finalFrame);
		await waitFor(() => playerRef.current!.getCurrentFrame() === finalFrame);
		await wait(500);

		playerRef.current!.pause();
		const afterStepBackAndForwardBlob = await canvasToBlob(
			findLargestCanvas(container),
		);
		await testImage({
			blob: afterStepBackAndForwardBlob,
			testId: afterStepBackAndForwardScreenshot,
		});
	} finally {
		root.unmount();
		container.remove();
	}
});

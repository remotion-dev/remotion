import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Loop} from 'remotion';
import {expect, onTestFinished, test} from 'vitest';
import {page} from 'vitest/browser';
import {Video} from '../video/video';

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
	return (
		<Loop durationInFrames={loopDurationInFrames} times={3} name="MediaLoop">
			<Video src={src} debugOverlay />
		</Loop>
	);
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
			allowedMismatchedPixelRatio: 0.001,
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
			durationInFrames={loopDurationInFrames * 3}
			fps={fps}
			initiallyMuted
			inputProps={{}}
		/>
	);
};

const seekToAndWait = async (
	playerRef: React.RefObject<PlayerRef | null>,
	frame: number,
) => {
	playerRef.current!.seekTo(frame);
	await waitFor(() => playerRef.current!.getCurrentFrame() === frame);
	await wait(500);
};

test('keeps preview frame stepping visually accurate when stepping back over a loop boundary', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	root.render(<TestPlayer playerRef={playerRef} />);

	try {
		await waitFor(() => playerRef.current !== null);
		await waitUntilCanvasIsVisible(container);

		playerRef.current!.play();
		await waitFor(
			() => playerRef.current!.getCurrentFrame() >= firstFrameAfterBoundary,
		);
		await wait(250);
		playerRef.current!.pause();
		await wait(250);

		for (const frame of framesToStepBackThrough) {
			await seekToAndWait(playerRef, frame);
		}

		await seekToAndWait(playerRef, boundaryFrame);
		const boundaryFrameBlob = await canvasToBlob(findLargestCanvas(container));
		await testImage({
			blob: boundaryFrameBlob,
			testId: boundaryFrameScreenshot,
		});

		await seekToAndWait(playerRef, beforeBoundaryFrame);
		const beforeBoundaryFrameBlob = await canvasToBlob(
			findLargestCanvas(container),
		);
		await testImage({
			blob: beforeBoundaryFrameBlob,
			testId: beforeBoundaryFrameScreenshot,
		});
	} finally {
		root.unmount();
		container.remove();
	}
});

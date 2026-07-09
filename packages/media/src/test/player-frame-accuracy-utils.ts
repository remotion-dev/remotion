import type {PlayerRef} from '@remotion/player';
import type React from 'react';
import {expect, onTestFinished} from 'vitest';
import {page} from 'vitest/browser';

const previewWidth = 360;
const previewHeight = 202;

export const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 15000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	throw new Error('Timed out waiting for condition');
};

export const wait = (duration: number) => {
	return new Promise((resolve) => setTimeout(resolve, duration));
};

export const findLargestCanvas = (
	container: HTMLElement,
): HTMLCanvasElement => {
	const canvases = [...container.querySelectorAll('canvas')];
	if (canvases.length === 0) {
		throw new Error('No canvas found');
	}

	return canvases.sort((a, b) => b.width * b.height - a.width * a.height)[0];
};

export const canvasToBlob = async (canvas: HTMLCanvasElement) => {
	const preview = document.createElement('canvas');
	preview.width = previewWidth;
	preview.height = previewHeight;

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

export const testImage = async ({
	allowedMismatchedPixelRatio,
	blob,
	testId,
}: {
	allowedMismatchedPixelRatio: number;
	blob: Blob;
	testId: string;
}) => {
	const img = document.createElement('img');
	const objectUrl = URL.createObjectURL(blob);
	img.dataset.testid = testId;
	img.style.display = 'block';
	img.style.width = `${previewWidth}px`;
	img.style.height = `${previewHeight}px`;
	document.body.appendChild(img);

	onTestFinished(() => {
		document.body.removeChild(img);
		URL.revokeObjectURL(objectUrl);
	});

	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error('Image failed to load'));
		img.src = objectUrl;
	});

	await expect(page.getByTestId(testId)).toMatchScreenshot(testId, {
		comparatorOptions: {
			threshold: 0,
			allowedMismatchedPixelRatio,
		},
	});
};

export const waitUntilCanvasIsVisible = async ({
	container,
	height,
	width,
}: {
	container: HTMLElement;
	height: number;
	width: number;
}) => {
	await waitFor(() => {
		const canvas = findLargestCanvas(container);
		return canvas.width === width && canvas.height === height;
	});
};

export const seekToAndWait = async ({
	frame,
	playerRef,
	settleTime,
}: {
	frame: number;
	playerRef: React.RefObject<PlayerRef | null>;
	settleTime: number;
}) => {
	playerRef.current!.seekTo(frame);
	await waitFor(() => playerRef.current!.getCurrentFrame() === frame);
	await wait(settleTime);
};

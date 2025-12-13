import {expect, onTestFinished} from 'vitest';
import {page} from 'vitest/browser';
import {withResolvers} from '../with-resolvers';

export const testImage = async ({
	blob,
	testId,
	threshold = 0.15,
}: {
	blob: Blob;
	testId: string;
	threshold?: number;
}) => {
	const img = document.createElement('img');
	img.src = URL.createObjectURL(blob);
	img.dataset.testid = testId;
	document.body.appendChild(img);

	onTestFinished(() => {
		document.body.removeChild(img);
	});

	const {promise, resolve, reject} = withResolvers<void>();
	img.onload = () => {
		resolve();
	};

	img.onerror = () => {
		reject(new Error('Image failed to load'));
	};

	await promise;

	await expect(page.getByTestId(testId)).toMatchScreenshot(testId, {
		comparatorOptions: {
			threshold,
			allowedMismatchedPixelRatio: 0.01,
		},
	});
};

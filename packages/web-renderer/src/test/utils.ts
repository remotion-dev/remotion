import {expect, onTestFinished} from 'vitest';
import {page, server} from 'vitest/browser';
import {withResolvers} from '../with-resolvers';

export const testImage = async ({
	blob,
	testId,
	threshold = 0.15,
	allowedMismatchedPixelRatio = 0.001,
}: {
	blob: Blob;
	testId: string;
	threshold?: number;
	allowedMismatchedPixelRatio?: number;
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

	// Vitest 4 scaled larger test viewports to fit the configured browser viewport.
	// Keep that presentation during screenshots so the existing references still apply.
	const scale = Math.min(
		1,
		server.config.browser.viewport.width / window.innerWidth,
		server.config.browser.viewport.height / window.innerHeight,
	);
	const {transform, transformOrigin} = document.documentElement.style;
	try {
		document.documentElement.style.transform = `scale(${scale})`;
		document.documentElement.style.transformOrigin = 'top left';
		await expect(page.getByTestId(testId)).toMatchScreenshot(testId, {
			comparatorOptions: {
				threshold,
				allowedMismatchedPixelRatio,
			},
		});
	} finally {
		document.documentElement.style.transform = transform;
		document.documentElement.style.transformOrigin = transformOrigin;
	}
};

import {expect} from 'vitest';
import {page} from 'vitest/browser';

export const testImage = async ({
	blob,
	testId,
}: {
	blob: Blob;
	testId: string;
}) => {
	const img = document.createElement('img');
	img.src = URL.createObjectURL(blob);
	img.dataset.testid = 'test-img';
	document.body.appendChild(img);

	await expect(page.getByTestId(testId)).toMatchScreenshot(testId);
};

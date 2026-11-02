import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {
	issue12604Direct,
	issue12604DirectFractional,
	issue12604Precomposed,
	issue12604PrecomposedFractional,
} from './fixtures/issue-12604-scaled-precompose-text';

type Fixture = Omit<typeof issue12604Direct, 'id'> & {id: string};

const renderPixels = async (composition: Fixture) => {
	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition,
			frame: 0,
			inputProps: {},
		})
	).blob({format: 'png'});

	const image = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(composition.width, composition.height);
	const context = canvas.getContext('2d');
	if (!context) {
		throw new Error('Could not get 2D context');
	}

	context.drawImage(image, 0, 0);
	image.close();

	return context.getImageData(0, 0, composition.width, composition.height).data;
};

const countDifferingPixels = async (direct: Fixture, precomposed: Fixture) => {
	const directPixels = await renderPixels(direct);
	const precomposedPixels = await renderPixels(precomposed);

	let differingPixels = 0;
	for (let i = 0; i < directPixels.length; i += 4) {
		const maxChannelDiff = Math.max(
			Math.abs(directPixels[i] - precomposedPixels[i]),
			Math.abs(directPixels[i + 1] - precomposedPixels[i + 1]),
			Math.abs(directPixels[i + 2] - precomposedPixels[i + 2]),
			Math.abs(directPixels[i + 3] - precomposedPixels[i + 3]),
		);
		if (maxChannelDiff > 48) {
			differingPixels++;
		}
	}

	return differingPixels;
};

// Regression: https://github.com/remotion-dev/remotion/issues/12604
// A no-op drop-shadow forces precompositing. Inside a scale(0.9) ancestor,
// the precomposited text should look the same as when drawn directly.
test('issue-12604 precomposited text inside a scaled ancestor matches the direct render', async () => {
	expect(
		await countDifferingPixels(issue12604Direct, issue12604Precomposed),
	).toBe(0);
});

test('issue-12604 precomposited text inside a scaled ancestor at a fractional position matches the direct render', async () => {
	expect(
		await countDifferingPixels(
			issue12604DirectFractional,
			issue12604PrecomposedFractional,
		),
	).toBe(0);
});

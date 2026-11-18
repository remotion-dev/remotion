import {PNG} from 'pngjs';

export type NativePngComparison = {
	width: number;
	height: number;
	mismatchedPixels: number;
	maxChannelDelta: number;
	diff: string | null;
};

const emptyDiffs = new Map<string, string>();

export const compareNativePngs = (
	reference: string,
	actual: string,
	createDiff: boolean,
): NativePngComparison => {
	const expected = PNG.sync.read(Buffer.from(reference, 'base64'));
	const received = PNG.sync.read(Buffer.from(actual, 'base64'));
	if (
		expected.width !== received.width ||
		expected.height !== received.height
	) {
		throw new Error(
			`Dimensions differ: ${expected.width}x${expected.height} vs ${received.width}x${received.height}`,
		);
	}

	let mismatchedPixels = 0;
	let maxChannelDelta = 0;
	let diff: PNG | null = null;
	for (let offset = 0; offset < expected.data.length; offset += 4) {
		let differs = false;
		for (let channel = 0; channel < 4; channel++) {
			const delta = Math.abs(
				expected.data[offset + channel] - received.data[offset + channel],
			);
			if (delta !== 0) differs = true;
			maxChannelDelta = Math.max(maxChannelDelta, delta);
		}

		if (differs) {
			mismatchedPixels++;
			if (createDiff) {
				diff ??= new PNG({width: expected.width, height: expected.height});
				diff.data.set([255, 0, 255, 255], offset);
			}
		}
	}

	let encodedDiff: string | null = null;
	if (createDiff) {
		if (diff) encodedDiff = PNG.sync.write(diff).toString('base64');
		else {
			const key = `${expected.width}x${expected.height}`;
			if (!emptyDiffs.has(key))
				emptyDiffs.set(
					key,
					PNG.sync
						.write(new PNG({width: expected.width, height: expected.height}))
						.toString('base64'),
				);
			encodedDiff = emptyDiffs.get(key)!;
		}
	}

	return {
		width: expected.width,
		height: expected.height,
		mismatchedPixels,
		maxChannelDelta,
		diff: encodedDiff,
	};
};

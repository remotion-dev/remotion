import {
	Internals,
	type EffectDefinitionAndStack,
	type EffectDescriptor,
} from 'remotion';
import {expect, onTestFinished} from 'vitest';
import {page} from 'vitest/browser';

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
		URL.revokeObjectURL(img.src);
	});

	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = () => reject(new Error('Image failed to load'));
	});

	await expect(page.getByTestId(testId)).toMatchScreenshot(testId, {
		comparatorOptions: {
			threshold,
			allowedMismatchedPixelRatio,
		},
	});
};

export const descriptorsToMemoizedEffects = (
	effects: EffectDescriptor<unknown>[],
): EffectDefinitionAndStack<unknown>[] => {
	return effects.map((effect) => ({
		...effect,
		memoized: true,
	}));
};

const makeTestSource = (width: number, height: number): HTMLCanvasElement => {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get 2D context');
	}

	ctx.fillStyle = '#f8f8f8';
	ctx.fillRect(0, 0, width, height);

	ctx.fillStyle = '#e31b23';
	ctx.fillRect(0, 0, width / 2, height / 2);
	ctx.fillStyle = '#0aa83f';
	ctx.fillRect(width / 2, 0, width / 2, height / 2);
	ctx.fillStyle = '#1d4ed8';
	ctx.fillRect(0, height / 2, width / 2, height / 2);
	ctx.fillStyle = '#facc15';
	ctx.fillRect(width / 2, height / 2, width / 2, height / 2);

	ctx.fillStyle = 'white';
	ctx.font = 'bold 38px sans-serif';
	ctx.textBaseline = 'top';
	ctx.fillText('TOP', 12, 10);
	ctx.fillStyle = 'black';
	ctx.textBaseline = 'bottom';
	ctx.fillText('BOTTOM', 12, height - 8);

	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.moveTo(width - 30, 12);
	ctx.lineTo(width - 12, 46);
	ctx.lineTo(width - 48, 46);
	ctx.closePath();
	ctx.fill();

	return canvas;
};

export const renderEffectChainToCanvas = async ({
	effects,
	width = 320,
	height = 180,
	source = makeTestSource(width, height),
}: {
	effects: EffectDefinitionAndStack<unknown>[];
	width?: number;
	height?: number;
	source?: CanvasImageSource;
}): Promise<HTMLCanvasElement> => {
	const output = document.createElement('canvas');
	output.width = width;
	output.height = height;

	const state = Internals.createEffectChainState(width, height);
	try {
		const completed = await Internals.runEffectChain({
			state,
			source,
			effects,
			output,
			width,
			height,
		});

		if (!completed) {
			throw new Error('Effect chain was cancelled');
		}
	} finally {
		Internals.cleanupEffectChainState(state);
	}

	return output;
};

export const renderEffectChainToBlob = async ({
	effects,
	width = 320,
	height = 180,
	source = makeTestSource(width, height),
}: {
	effects: EffectDefinitionAndStack<unknown>[];
	width?: number;
	height?: number;
	source?: CanvasImageSource;
}): Promise<Blob> => {
	const output = await renderEffectChainToCanvas({
		effects,
		width,
		height,
		source,
	});

	const blob = await new Promise<Blob>((resolve, reject) => {
		output.toBlob((result) => {
			if (result) {
				resolve(result);
			} else {
				reject(new Error('Could not encode canvas as PNG'));
			}
		}, 'image/png');
	});

	return blob;
};

import {createEffect, type InteractivitySchema} from 'remotion';

export type SamplePosterize2dParams = {
	readonly levels?: number;
	readonly amount?: number;
};

const DEFAULT_LEVELS = 5;
const DEFAULT_AMOUNT = 1;

const samplePosterize2dSchema = {
	levels: {
		type: 'number',
		min: 2,
		max: 16,
		step: 1,
		default: DEFAULT_LEVELS,
		description: 'Levels',
		hiddenFromList: false,
	},
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_AMOUNT,
		description: 'Amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const resolve = (params: SamplePosterize2dParams) => ({
	levels: params.levels ?? DEFAULT_LEVELS,
	amount: params.amount ?? DEFAULT_AMOUNT,
});

const quantize = (value: number, levels: number): number => {
	const step = 255 / (levels - 1);
	return Math.round(value / step) * step;
};

export const samplePosterize2d = createEffect<SamplePosterize2dParams, null>({
	type: 'dev.remotion.example.samplePosterize2d',
	label: 'samplePosterize2d()',
	documentationLink: 'https://www.remotion.dev/docs/create-effect',
	backend: '2d',
	calculateKey: (params) => {
		const {levels, amount} = resolve(params);
		return `sample-posterize-2d-${levels}-${amount}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get a 2D context for samplePosterize2d().');
		}

		const {levels, amount} = resolve(params);

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(source, 0, 0, width, height);

		const imageData = ctx.getImageData(0, 0, width, height);
		const {data} = imageData;

		for (let i = 0; i < data.length; i += 4) {
			data[i] += (quantize(data[i], levels) - data[i]) * amount;
			data[i + 1] += (quantize(data[i + 1], levels) - data[i + 1]) * amount;
			data[i + 2] += (quantize(data[i + 2], levels) - data[i + 2]) * amount;
		}

		ctx.putImageData(imageData, 0, 0);
	},
	cleanup: () => undefined,
	schema: samplePosterize2dSchema,
	validateParams: ({levels = DEFAULT_LEVELS, amount = DEFAULT_AMOUNT}) => {
		if (
			typeof levels !== 'number' ||
			!Number.isFinite(levels) ||
			levels < 2 ||
			levels > 16
		) {
			throw new TypeError('levels must be a number between 2 and 16');
		}

		if (
			typeof amount !== 'number' ||
			!Number.isFinite(amount) ||
			amount < 0 ||
			amount > 1
		) {
			throw new TypeError('amount must be a number between 0 and 1');
		}
	},
});

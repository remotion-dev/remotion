import {createEffect, type InteractivitySchema} from 'remotion';

type Rgb = readonly [number, number, number];

export type PaletteMapParams = {
	readonly palette?: readonly string[];
	readonly amount?: number;
};

const DEFAULT_PALETTE = ['#111827', '#06b6d4', '#facc15'] as const;

export const paletteMapSchema = {
	palette: {
		type: 'array',
		item: {
			type: 'color',
		},
		default: DEFAULT_PALETTE,
		newItemDefault: '#ffffff',
		minLength: 1,
		description: 'Palette',
	},
	amount: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 1,
		description: 'Amount',
		hiddenFromList: false,
	},
} as const satisfies InteractivitySchema;

const parseCssColor = (color: string, target: HTMLCanvasElement): Rgb => {
	const canvas = target.ownerDocument.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get a 2D context for paletteMap()');
	}

	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);

	const data = ctx.getImageData(0, 0, 1, 1).data;
	return [data[0], data[1], data[2]];
};

const distanceSquared = (a: Rgb, b: Rgb): number => {
	return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
};

const findClosestColor = (color: Rgb, palette: Rgb[]): Rgb => {
	let closest = palette[0] ?? color;
	let closestDistance = distanceSquared(color, closest);

	for (const candidate of palette) {
		const distance = distanceSquared(color, candidate);
		if (distance < closestDistance) {
			closest = candidate;
			closestDistance = distance;
		}
	}

	return closest;
};

export const paletteMap = createEffect<PaletteMapParams, null>({
	type: 'com.example.paletteMap',
	label: 'paletteMap()',
	documentationLink: 'https://www.remotion.dev/docs/create-effect',
	backend: '2d',
	calculateKey: ({palette = DEFAULT_PALETTE, amount = 1}) => {
		return `palette-map-${palette.join('-')}-${amount}`;
	},
	setup: () => null,
	apply: ({source, target, width, height, params}) => {
		const ctx = target.getContext('2d');
		if (!ctx) {
			throw new Error('Could not get a 2D context for paletteMap()');
		}

		const palette = (params.palette ?? DEFAULT_PALETTE).map((color) =>
			parseCssColor(color, target),
		);
		const amount = params.amount ?? 1;

		ctx.clearRect(0, 0, width, height);
		ctx.drawImage(source, 0, 0, width, height);

		const imageData = ctx.getImageData(0, 0, width, height);
		const {data} = imageData;

		for (let i = 0; i < data.length; i += 4) {
			const closest = findClosestColor(
				[data[i], data[i + 1], data[i + 2]],
				palette,
			);

			data[i] = data[i] + (closest[0] - data[i]) * amount;
			data[i + 1] = data[i + 1] + (closest[1] - data[i + 1]) * amount;
			data[i + 2] = data[i + 2] + (closest[2] - data[i + 2]) * amount;
		}

		ctx.putImageData(imageData, 0, 0);
	},
	cleanup: () => undefined,
	schema: paletteMapSchema,
	validateParams: ({palette = DEFAULT_PALETTE, amount = 1}) => {
		if (
			!Array.isArray(palette) ||
			palette.length === 0 ||
			!palette.every((color) => typeof color === 'string')
		) {
			throw new TypeError('palette must be a non-empty array of CSS colors');
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

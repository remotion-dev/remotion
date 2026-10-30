import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {createColorMatrixImplementations} from './color-matrix-runtime.js';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	type ParsedColorRgba,
	validateUnitInterval,
} from './color-utils.js';
import {
	assertEffectParamsObject,
	assertRequiredColor,
} from './validate-effect-param.js';

const {createEffect} = Internals;

const DEFAULT_AMOUNT = 0.5 as const;

export const tintSchema = {
	color: {
		type: 'color',
		default: undefined,
		description: 'Color',
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

export type TintParams = {
	readonly color: string;
	readonly amount?: number;
};

type TintResolved = {
	color: string;
	amount: number;
};

const resolve = (p: TintParams): TintResolved => ({
	color: p.color,
	amount: p.amount ?? DEFAULT_AMOUNT,
});

const validateTintParams = (params: TintParams): void => {
	assertEffectParamsObject(params, 'Tint');
	assertRequiredColor(params.color, 'color');
	assertOptionalFiniteNumber(params.amount, 'amount');

	if (params.amount !== undefined) {
		validateUnitInterval(params.amount, 'amount');
	}
};

// Cache parsed CSS colors for the shader implementations.
let colorContext: CanvasRenderingContext2D | null = null;
let cachedColor: {key: string; value: ParsedColorRgba} | null = null;
const shaderImplementations = createColorMatrixImplementations<TintParams>(
	'tint',
	(params) => {
		if (!colorContext) {
			const colorCanvas = document.createElement('canvas');
			colorCanvas.width = 1;
			colorCanvas.height = 1;
			colorContext = colorCanvas.getContext('2d', {willReadFrequently: true});
			if (!colorContext)
				throw new Error('Failed to acquire 2D context for color parsing');
		}

		if (cachedColor?.key !== params.color)
			cachedColor = {
				key: params.color,
				value: parseColorRgba(colorContext, params.color),
			};
		const color = cachedColor.value;
		const amount = ((params.amount ?? DEFAULT_AMOUNT) * color[3]) / 255;
		return new Float32Array([
			1 - amount,
			0,
			0,
			(color[0] / 255) * amount,
			0,
			1 - amount,
			0,
			(color[1] / 255) * amount,
			0,
			0,
			1 - amount,
			(color[2] / 255) * amount,
			0,
			0,
			0,
			0,
		]);
	},
);
export const tint = createEffect<TintParams>({
	type: 'dev.remotion.effects.tint',
	label: 'tint()',
	documentationLink: 'https://www.remotion.dev/docs/effects/tint',
	calculateKey: (params) => {
		const r = resolve(params);
		return `tint-${r.color}-${r.amount}`;
	},
	implementations: {
		...shaderImplementations,
		'2d': Internals.createEffectImplementation<TintParams, null>({
			setup: () => null,
			apply: ({source, target, width, height, params}) => {
				const ctx = target.getContext('2d');
				if (!ctx) {
					throw new Error(
						'Failed to acquire 2D context for tint effect. The canvas may have been assigned a different context type.',
					);
				}

				const r = resolve(params);
				const amount = Math.max(0, Math.min(1, r.amount));

				ctx.clearRect(0, 0, width, height);
				ctx.globalAlpha = 1;
				ctx.globalCompositeOperation = 'source-over';
				ctx.drawImage(source, 0, 0, width, height);

				// `source-atop` only paints inside non-transparent regions of the source,
				// so the tint respects the source's alpha mask.
				ctx.globalAlpha = amount;
				ctx.globalCompositeOperation = 'source-atop';
				ctx.fillStyle = r.color;
				ctx.fillRect(0, 0, width, height);

				ctx.globalAlpha = 1;
				ctx.globalCompositeOperation = 'source-over';
			},
			cleanup: () => undefined,
		}),
	},
	schema: tintSchema,
	validateParams: validateTintParams,
});

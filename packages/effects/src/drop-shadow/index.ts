import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	parseColorRgba,
	validateNonNegative,
	validateUnitInterval,
} from '../color-utils.js';
import {
	assertEffectParamsObject,
	assertOptionalColor,
} from '../validate-effect-param.js';
import {
	applyDropShadow,
	cleanupDropShadow,
	setupDropShadow,
	type DropShadowState,
} from './drop-shadow-runtime.js';

const {createEffect} = Internals;

const DEFAULT_RADIUS = 12 as const;
const DEFAULT_OFFSET_X = 8 as const;
const DEFAULT_OFFSET_Y = 8 as const;
const DEFAULT_OPACITY = 0.5 as const;
const DEFAULT_COLOR = '#000000' as const;

const dropShadowSchema = {
	radius: {
		type: 'number',
		min: 0,
		max: 100,
		step: 1,
		default: DEFAULT_RADIUS,
		description: 'Radius',
		hiddenFromList: false,
	},
	offsetX: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET_X,
		description: 'Offset X',
		hiddenFromList: false,
	},
	offsetY: {
		type: 'number',
		step: 1,
		default: DEFAULT_OFFSET_Y,
		description: 'Offset Y',
		hiddenFromList: false,
	},
	opacity: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: DEFAULT_OPACITY,
		description: 'Opacity',
		hiddenFromList: false,
	},
	color: {
		type: 'color',
		default: DEFAULT_COLOR,
		description: 'Color',
	},
} as const satisfies InteractivitySchema;

export type DropShadowParams = {
	/** Blur radius of the shadow in pixels. Defaults to `12`. */
	readonly radius?: number;
	/** Horizontal shadow offset in pixels. Defaults to `8`. */
	readonly offsetX?: number;
	/** Vertical shadow offset in pixels. Defaults to `8`. */
	readonly offsetY?: number;
	/** Shadow opacity from `0` to `1`. Defaults to `0.5`. */
	readonly opacity?: number;
	/** Color of the shadow. Defaults to black. */
	readonly color?: string;
};

type DropShadowResolved = {
	readonly radius: number;
	readonly offsetX: number;
	readonly offsetY: number;
	readonly opacity: number;
	readonly color: string;
};

const resolve = (p: DropShadowParams): DropShadowResolved => ({
	radius: p.radius ?? DEFAULT_RADIUS,
	offsetX: p.offsetX ?? DEFAULT_OFFSET_X,
	offsetY: p.offsetY ?? DEFAULT_OFFSET_Y,
	opacity: p.opacity ?? DEFAULT_OPACITY,
	color: p.color ?? DEFAULT_COLOR,
});

const validateDropShadowParams = (params: DropShadowParams): void => {
	assertEffectParamsObject(params, 'Drop shadow');
	assertOptionalFiniteNumber(params.radius, 'radius');
	assertOptionalFiniteNumber(params.offsetX, 'offsetX');
	assertOptionalFiniteNumber(params.offsetY, 'offsetY');
	assertOptionalFiniteNumber(params.opacity, 'opacity');
	assertOptionalColor(params.color, 'color');

	const r = resolve(params);
	validateNonNegative(r.radius, 'radius');
	validateUnitInterval(r.opacity, 'opacity');
};

export const dropShadow = createEffect<DropShadowParams, DropShadowState>({
	type: 'dev.remotion.effects.dropShadow',
	label: 'dropShadow()',
	documentationLink: 'https://www.remotion.dev/docs/effects/drop-shadow',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `drop-shadow-${r.radius}-${r.offsetX}-${r.offsetY}-${r.opacity}-${r.color}`;
	},
	setup: (target) => setupDropShadow(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);

		if (state.cachedColorStr !== r.color) {
			state.cachedColorStr = r.color;
			state.cachedColorRgba = parseColorRgba(state.colorCtx, r.color);
		}

		applyDropShadow({
			state,
			source,
			width,
			height,
			radius: r.radius,
			offsetX: r.offsetX,
			offsetY: r.offsetY,
			opacity: r.opacity,
			color: state.cachedColorRgba,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupDropShadow(state),
	schema: dropShadowSchema,
	validateParams: validateDropShadowParams,
});

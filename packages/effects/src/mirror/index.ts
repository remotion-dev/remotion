import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {
	assertOptionalFiniteNumber,
	validateUnitInterval,
} from '../color-utils.js';
import {assertEffectParamsObject} from '../validate-effect-param.js';
import {
	applyMirror,
	cleanupMirror,
	setupMirror,
	type MirrorDirection,
	type MirrorState,
} from './mirror-runtime.js';

const {createEffect} = Internals;

const mirrorSchema = {
	direction: {
		type: 'enum',
		variants: {
			horizontal: {},
			vertical: {},
		},
		default: 'horizontal' as const,
		description: 'Direction',
	},
	position: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		default: 0.5,
		description: 'Position',
		hiddenFromList: false,
	},
	invert: {
		type: 'boolean',
		default: false,
		description: 'Invert',
	},
} as const satisfies InteractivitySchema;

export type {MirrorDirection};

export type MirrorParams = {
	/** Mirror direction. Defaults to `horizontal`. */
	readonly direction?: MirrorDirection;
	/** Mirror position in UV coordinates. Defaults to `0.5`. */
	readonly position?: number;
	/** Mirror the other side of the image. Defaults to `false`. */
	readonly invert?: boolean;
};

type MirrorResolved = {
	direction: MirrorDirection;
	position: number;
	invert: boolean;
};

const resolve = (p: MirrorParams): MirrorResolved => ({
	direction: p.direction ?? 'horizontal',
	position: p.position ?? 0.5,
	invert: p.invert ?? false,
});

const validateMirrorParams = (params: MirrorParams): void => {
	assertEffectParamsObject(params, 'Mirror');
	assertOptionalFiniteNumber(params.position, 'position');

	if (
		params.direction !== undefined &&
		params.direction !== 'horizontal' &&
		params.direction !== 'vertical'
	) {
		throw new TypeError(
			`"direction" must be "horizontal" or "vertical", but got ${JSON.stringify(params.direction)}`,
		);
	}

	if (params.invert !== undefined && typeof params.invert !== 'boolean') {
		throw new TypeError(
			`"invert" must be a boolean, but got ${JSON.stringify(params.invert)}`,
		);
	}

	const {position} = resolve(params);
	validateUnitInterval(position, 'position');
};

export const mirror = createEffect<MirrorParams, MirrorState>({
	type: 'dev.remotion.effects.mirror',
	label: 'mirror()',
	documentationLink: 'https://www.remotion.dev/docs/effects/mirror',
	backend: 'webgl2',
	calculateKey: (params) => {
		const r = resolve(params);
		return `mirror-${r.direction}-${r.position}-${r.invert ? 1 : 0}`;
	},
	setup: (target) => setupMirror(target),
	apply: ({source, width, height, params, state, flipSourceY}) => {
		const r = resolve(params);
		applyMirror({
			state,
			source,
			width,
			height,
			position: r.position,
			direction: r.direction,
			invert: r.invert,
			flipSourceY,
		});
	},
	cleanup: (state) => cleanupMirror(state),
	schema: mirrorSchema,
	validateParams: validateMirrorParams,
});

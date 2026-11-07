import type {InteractivitySchema} from 'remotion';
import {validateUnitInterval} from '../color-utils.js';
import type {UvCoordinate} from '../uv-coordinate.js';
import {
	assertEffectParamsObject,
	assertOptionalBoolean,
	assertOptionalColor,
	assertRequiredFiniteNumber,
} from '../validate-effect-param.js';

export type LightningType =
	| 'direction'
	| 'strike'
	| 'breaking'
	| 'bouncy'
	| 'omni'
	| 'anywhere'
	| 'vertical'
	| 'two-way-strike';
export type LightningFractalType = 'linear' | 'semi-linear' | 'spline';

export type LightningParams = {
	readonly lightningType?: LightningType;
	/** Starting UV coordinate measured from the top-left. Defaults to [0.5, 0]. */
	readonly origin?: UvCoordinate;
	/** Destination or direction in UV coordinates. Defaults to [0.5, 1]. */
	readonly direction?: UvCoordinate;
	/** Each integer selects a repeatable bolt shape. Defaults to 10. */
	readonly conductivityState?: number;
	/** Radius of the bright center in pixels. Defaults to 3. */
	readonly coreRadius?: number;
	readonly coreOpacity?: number;
	readonly coreColor?: string;
	/** Radius of the surrounding glow in pixels. Defaults to 50. */
	readonly glowRadius?: number;
	readonly glowOpacity?: number;
	readonly glowColor?: string;
	readonly turbulence?: number;
	readonly forking?: number;
	readonly decay?: number;
	readonly decayMainCore?: boolean;
	/** Positive values repel the bolt from opaque pixels, negative values attract it. Ranges from -10 to 10. */
	readonly alphaObstacle?: number;
	/** Include the source behind the lightning. Defaults to true. */
	readonly compositeOnOriginal?: boolean;
	/** Number of subdivisions, from 1 to 12. Defaults to 6. */
	readonly complexity?: number;
	readonly minForkDistance?: number;
	readonly terminationThreshold?: number;
	readonly mainCoreCollisionOnly?: boolean;
	readonly fractalType?: LightningFractalType;
	readonly coreDrain?: number;
	readonly forkStrength?: number;
	readonly forkVariation?: number;
	/** Unsigned 32-bit seed for the bolt pattern. Defaults to 0. */
	readonly seed?: number;
};

const numberField = (
	description: string,
	defaultValue: number,
	[min, max]: readonly [number, number],
	step: number,
) =>
	({
		type: 'number',
		description,
		default: defaultValue,
		min,
		max,
		step,
		hiddenFromList: false,
	}) as const;

const uvCoordinateField = (description: string, defaultValue: UvCoordinate) =>
	({
		type: 'uv-coordinate',
		description,
		default: defaultValue,
		min: 0,
		max: 1,
		step: 0.01,
	}) as const;

export const lightningSchema = {
	lightningType: {
		type: 'enum',
		description: 'Lightning type',
		variants: {
			direction: {},
			strike: {},
			breaking: {},
			bouncy: {},
			omni: {},
			anywhere: {},
			vertical: {},
			'two-way-strike': {},
		},
		default: 'strike',
	},
	origin: {
		...uvCoordinateField('Origin', [0.5, 0]),
		visual: {type: 'line', to: 'direction'},
	},
	direction: uvCoordinateField('Direction', [0.5, 1]),
	conductivityState: numberField('Conductivity state', 10, [0, 100000], 1),
	coreRadius: numberField('Core radius', 3, [0, 100], 0.1),
	coreOpacity: numberField('Core opacity', 0.75, [0, 1], 0.01),
	coreColor: {type: 'color', description: 'Core color', default: '#ffffff'},
	glowRadius: numberField('Glow radius', 50, [0, 1000], 0.1),
	glowOpacity: numberField('Glow opacity', 0.5, [0, 1], 0.01),
	glowColor: {type: 'color', description: 'Glow color', default: '#4059ff'},
	turbulence: numberField('Turbulence', 1, [0, 10], 0.01),
	forking: numberField('Forking', 0.25, [0, 1], 0.01),
	decay: numberField('Decay', 0.3, [0, 1], 0.01),
	decayMainCore: {
		type: 'boolean',
		description: 'Decay main core',
		default: false,
	},
	alphaObstacle: numberField('Alpha obstacle', 0, [-10, 10], 0.1),
	compositeOnOriginal: {
		type: 'boolean',
		description: 'Composite on original',
		default: true,
	},
	complexity: {...numberField('Complexity', 6, [1, 12], 1), integer: true},
	minForkDistance: numberField('Min fork distance', 0, [0, 1000], 1),
	terminationThreshold: numberField(
		'Termination threshold',
		0.05,
		[0, 1],
		0.01,
	),
	mainCoreCollisionOnly: {
		type: 'boolean',
		description: 'Main core collision only',
		default: false,
	},
	fractalType: {
		type: 'enum',
		description: 'Fractal type',
		variants: {linear: {}, 'semi-linear': {}, spline: {}},
		default: 'linear',
	},
	coreDrain: numberField('Core drain', 0, [0, 1], 0.01),
	forkStrength: numberField('Fork strength', 0.5, [0, 1], 0.01),
	forkVariation: numberField('Fork variation', 0, [0, 1], 0.01),
	seed: {...numberField('Seed', 0, [0, 4294967295], 1), integer: true},
} as const satisfies InteractivitySchema;

export const resolve = (
	params: LightningParams,
): Required<LightningParams> => ({
	lightningType: params.lightningType ?? lightningSchema.lightningType.default,
	origin: params.origin ?? lightningSchema.origin.default,
	direction: params.direction ?? lightningSchema.direction.default,
	conductivityState:
		params.conductivityState ?? lightningSchema.conductivityState.default,
	coreRadius: params.coreRadius ?? lightningSchema.coreRadius.default,
	coreOpacity: params.coreOpacity ?? lightningSchema.coreOpacity.default,
	coreColor: params.coreColor ?? lightningSchema.coreColor.default,
	glowRadius: params.glowRadius ?? lightningSchema.glowRadius.default,
	glowOpacity: params.glowOpacity ?? lightningSchema.glowOpacity.default,
	glowColor: params.glowColor ?? lightningSchema.glowColor.default,
	turbulence: params.turbulence ?? lightningSchema.turbulence.default,
	forking: params.forking ?? lightningSchema.forking.default,
	decay: params.decay ?? lightningSchema.decay.default,
	decayMainCore: params.decayMainCore ?? lightningSchema.decayMainCore.default,
	alphaObstacle: params.alphaObstacle ?? lightningSchema.alphaObstacle.default,
	compositeOnOriginal:
		params.compositeOnOriginal ?? lightningSchema.compositeOnOriginal.default,
	complexity: params.complexity ?? lightningSchema.complexity.default,
	minForkDistance:
		params.minForkDistance ?? lightningSchema.minForkDistance.default,
	terminationThreshold:
		params.terminationThreshold ?? lightningSchema.terminationThreshold.default,
	mainCoreCollisionOnly:
		params.mainCoreCollisionOnly ??
		lightningSchema.mainCoreCollisionOnly.default,
	fractalType: params.fractalType ?? lightningSchema.fractalType.default,
	coreDrain: params.coreDrain ?? lightningSchema.coreDrain.default,
	forkStrength: params.forkStrength ?? lightningSchema.forkStrength.default,
	forkVariation: params.forkVariation ?? lightningSchema.forkVariation.default,
	seed: params.seed ?? lightningSchema.seed.default,
});

export const validateLightningParams = (params: LightningParams): void => {
	assertEffectParamsObject(params, 'Lightning');
	for (const [name, field] of Object.entries(lightningSchema)) {
		const value = params[name as keyof LightningParams];
		if (value === undefined) continue;
		switch (field.type) {
			case 'number':
				assertRequiredFiniteNumber(value, name);
				if (
					typeof value !== 'number' ||
					value < field.min ||
					value > field.max
				) {
					throw new TypeError(
						`"${name}" must be between ${field.min} and ${field.max}`,
					);
				}

				if ('integer' in field && !Number.isInteger(value)) {
					throw new TypeError(`"${name}" must be an integer`);
				}

				break;
			case 'uv-coordinate':
				if (!Array.isArray(value) || value.length !== 2)
					throw new TypeError(`"${name}" must be a [number, number] tuple`);
				for (const coordinate of value) {
					assertRequiredFiniteNumber(coordinate, name);
					validateUnitInterval(coordinate, name);
				}

				break;
			case 'boolean':
				assertOptionalBoolean(value, name);
				break;
			case 'color':
				assertOptionalColor(value, name);
				break;
			case 'enum':
				if (typeof value !== 'string' || !Object.hasOwn(field.variants, value))
					throw new TypeError(`Invalid "${name}": ${JSON.stringify(value)}`);
				break;
			default:
				throw new TypeError(`Unknown lightning field "${name}"`);
		}
	}
};

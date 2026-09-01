import * as z from 'zod/mini';

export type EffectConfigValue =
	| string
	| number
	| boolean
	| null
	| EffectConfig
	| readonly EffectConfigValue[];

export type EffectConfig = {
	readonly [key: string]: EffectConfigValue;
};

export type EffectDragData = {
	type: 'remotion-effect';
	version: 1;
	effect: {
		name: string;
		importPath: string;
		config: EffectConfig;
	};
};

const effectConfigSchema = z.record(z.string(), z.json());
const effectDragDataSchema = z.object({
	type: z.literal('remotion-effect'),
	version: z.literal(1),
	effect: z.object({
		name: z.string(),
		importPath: z.string(),
		config: effectConfigSchema,
	}),
});

export const makeEffectDragData = (
	effect: EffectDragData['effect'],
): EffectDragData => {
	if (!z.safeParse(effectConfigSchema, effect.config).success) {
		throw new TypeError('Effect config must contain only finite JSON values');
	}

	return {
		type: 'remotion-effect',
		version: 1,
		effect,
	};
};

export const parseEffectDragData = (value: string): EffectDragData | null => {
	try {
		const parsed = z.safeParse(effectDragDataSchema, JSON.parse(value));
		if (!parsed.success) {
			return null;
		}

		return makeEffectDragData({
			name: parsed.data.effect.name,
			importPath: parsed.data.effect.importPath,
			config: parsed.data.effect.config,
		});
	} catch {
		return null;
	}
};

import {isRecord} from './validation';

export type EffectDragData = {
	type: 'remotion-effect';
	version: 1;
	effect: {
		name: string;
		importPath: string;
		config: Record<string, unknown>;
	};
};

export const makeEffectDragData = (
	effect: EffectDragData['effect'],
): EffectDragData => {
	return {
		type: 'remotion-effect',
		version: 1,
		effect,
	};
};

export const parseEffectDragData = (value: string): EffectDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-effect' ||
			parsed.version !== 1 ||
			!isRecord(parsed.effect)
		) {
			return null;
		}

		const {name, importPath, config} = parsed.effect;
		if (
			typeof name !== 'string' ||
			typeof importPath !== 'string' ||
			!isRecord(config)
		) {
			return null;
		}

		return makeEffectDragData({name, importPath, config});
	} catch {
		return null;
	}
};

export {EFFECT_DRAG_MIME_TYPE} from './drag-mime-types';

export type EffectDragData = {
	type: 'remotion-effect';
	version: 1;
	effect: {
		name: string;
		importPath: string;
		config: Record<string, unknown>;
	};
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const parseEffectDragData = (value: string): EffectDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (!isRecord(parsed)) {
			return null;
		}

		if (parsed.type !== 'remotion-effect' || parsed.version !== 1) {
			return null;
		}

		if (!isRecord(parsed.effect)) {
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

		return {
			type: 'remotion-effect',
			version: 1,
			effect: {
				name,
				importPath,
				config,
			},
		};
	} catch {
		return null;
	}
};

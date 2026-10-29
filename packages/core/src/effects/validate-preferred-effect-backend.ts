import type {PreferredEffectBackend} from './effect-types.js';
export const validatePreferredEffectBackend = (
	value: unknown,
): PreferredEffectBackend => {
	if (
		value !== 'auto' &&
		value !== 'webgpu' &&
		value !== 'webgl2' &&
		value !== '2d'
	) {
		throw new TypeError(
			`preferredEffectBackend must be "auto", "webgpu", "webgl2" or "2d", got ${String(value)}`,
		);
	}

	return value;
};

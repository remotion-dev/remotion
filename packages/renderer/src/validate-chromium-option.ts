export const validateChromiumOption = (
	value: unknown,
	name: 'flags' | 'features' | 'blinkFeatures',
) => {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new TypeError(`chromiumOptions.${name} must be an object.`);
	}

	for (const [key, entry] of Object.entries(value)) {
		if (
			!(
				name === 'flags'
					? /^[a-z0-9][a-z0-9_-]*$/
					: /^[a-zA-Z0-9_][a-zA-Z0-9_.-]*$/
			).test(key)
		) {
			throw new TypeError(
				`Invalid key "${key}" in chromiumOptions.${name}. Use a ${name === 'flags' ? 'lowercase flag name without the leading --' : 'feature name without parameters'}.`,
			);
		}

		if (
			name === 'flags' &&
			(key === 'user-data-dir' || key.startsWith('remote-debugging-'))
		) {
			throw new TypeError(`The Chrome flag "${key}" is managed by Remotion.`);
		}

		if (
			typeof entry !== 'boolean' &&
			!(name === 'flags' && typeof entry === 'string')
		) {
			throw new TypeError(
				`chromiumOptions.${name}["${key}"] must be ${name === 'flags' ? 'a string or boolean' : 'a boolean'}.`,
			);
		}
	}
};

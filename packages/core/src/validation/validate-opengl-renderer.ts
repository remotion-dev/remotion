const validRenderers = ['angle', 'egl', 'swiftshader'] as const;

export type OpenGlRenderer = typeof validRenderers[number];

export const validateOpenGlRenderer = (
	option: OpenGlRenderer
): OpenGlRenderer => {
	if (!validRenderers.includes(option)) {
		throw new TypeError(
			`${option} is not a valid GL backend. Accepted values: ${validRenderers.join(
				', '
			)}`
		);
	}

	return option;
};

const validRenderers = ['swangle', 'angle', 'egl', 'swiftshader'] as const;

export type OpenGlRenderer = typeof validRenderers[number];

export const DEFAULT_OPENGL_RENDERER: OpenGlRenderer | null = null;

export const validateOpenGlRenderer = (
	option: OpenGlRenderer | null
): OpenGlRenderer | null => {
	if (option === null) {
		return null;
	}

	if (!validRenderers.includes(option)) {
		throw new TypeError(
			`${option} is not a valid GL backend. Accepted values: ${validRenderers.join(
				', '
			)}`
		);
	}

	return option;
};

export const validOpenGlRenderers = [
	'swangle',
	'angle',
	'egl',
	'swiftshader',
] as const;

export type OpenGlRenderer = (typeof validOpenGlRenderers)[number];

export const DEFAULT_OPENGL_RENDERER: OpenGlRenderer | null = null;

export const validateOpenGlRenderer = (
	option: OpenGlRenderer | null,
): OpenGlRenderer | null => {
	if (option === null) {
		return null;
	}

	if (!validOpenGlRenderers.includes(option)) {
		throw new TypeError(
			`${option} is not a valid GL backend. Accepted values: ${validOpenGlRenderers.join(
				', ',
			)}`,
		);
	}

	return option;
};

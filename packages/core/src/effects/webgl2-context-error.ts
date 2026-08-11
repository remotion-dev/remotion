const WEBGL_CONTEXT_DOCS_URL =
	'https://remotion.dev/docs/troubleshooting/webgl2-context';

export const WEBGL2_CONTEXT_ERROR_MARKER = 'Failed to acquire WebGL2 context';

const webGlContextErrorMessage = (
	versionLabel: 'WebGL' | 'WebGL2',
	effectName: string,
): string =>
	`Failed to acquire ${versionLabel} context for ${effectName}. ` +
	'Pass --gl=angle when using the CLI, set chromiumOptions: { gl: "angle" } when using SSR APIs, ' +
	'or set "OpenGL render backend" to "angle" in the Advanced section when rendering in the Studio. ' +
	`See ${WEBGL_CONTEXT_DOCS_URL}`;

export const createWebGLContextError = (effectName: string): Error =>
	new Error(webGlContextErrorMessage('WebGL', effectName));

export const createWebGL2ContextError = (effectName: string): Error =>
	new Error(webGlContextErrorMessage('WebGL2', effectName));

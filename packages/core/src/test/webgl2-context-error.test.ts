import {describe, expect, test} from 'bun:test';
import {
	createWebGL2ContextError,
	createWebGLContextError,
	WEBGL2_CONTEXT_ERROR_MARKER,
} from '../effects/webgl2-context-error.js';

describe('WebGL context errors', () => {
	test('createWebGL2ContextError includes effect name and docs link', () => {
		const err = createWebGL2ContextError('blur effect');
		expect(err.message).toContain(WEBGL2_CONTEXT_ERROR_MARKER);
		expect(err.message).toContain('blur effect');
		expect(err.message).toContain('--gl=angle');
		expect(err.message).toContain('chromiumOptions: { gl: "angle" }');
		expect(err.message).toContain('OpenGL render backend');
		expect(err.message).toContain(
			'https://remotion.dev/docs/troubleshooting/webgl2-context',
		);
	});

	test('createWebGLContextError uses WebGL label', () => {
		const err = createWebGLContextError('light leak');
		expect(err.message).toContain(
			'Failed to acquire WebGL context for light leak',
		);
	});
});

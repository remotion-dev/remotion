import {expect, spyOn, test} from 'bun:test';
import {stripAnsi} from '@remotion/studio-shared';
import {logStudioErrorHandler} from '../preview-server/routes/log-studio-error';

test('logStudioErrorHandler logs Studio frontend errors with an intro phrase', async () => {
	const consoleSpy = spyOn(console, 'error').mockImplementation(
		() => undefined,
	);

	try {
		await logStudioErrorHandler({
			input: {
				name: 'TypeError',
				message: 'Cannot read properties of undefined',
				stack:
					'TypeError: Cannot read properties of undefined\n    at Component.tsx:1:1',
			},
			logLevel: 'error',
		} as Parameters<typeof logStudioErrorHandler>[0]);

		const logged = consoleSpy.mock.calls
			.map((call) => stripAnsi(call.join(' ')))
			.join('\n');
		expect(logged).toContain('An error occurred in the Studio:');
		expect(logged).toContain('TypeError: Cannot read properties of undefined');
		expect(logged).toContain('Component.tsx:1:1');
	} finally {
		consoleSpy.mockRestore();
	}
});

test('logStudioErrorHandler formats symbolicated stack frames with a code frame', async () => {
	const consoleSpy = spyOn(console, 'error').mockImplementation(
		() => undefined,
	);

	try {
		await logStudioErrorHandler({
			input: {
				name: 'RangeError',
				message: 'Invalid array length',
				stack: 'RangeError: Invalid array length',
				symbolicatedStackFrames: [
					{
						originalFunctionName: 'ErrorOnFrame10',
						originalFileName: 'src/ErrorOnFrame10/index.tsx',
						originalLineNumber: 5,
						originalColumnNumber: 8,
						originalScriptCode: [
							{
								lineNumber: 4,
								content: '  const frame = useCurrentFrame();',
								highlight: false,
							},
							{
								lineNumber: 5,
								content: '  if (frame === 10) {',
								highlight: true,
							},
						],
					},
				],
			},
			logLevel: 'error',
		} as Parameters<typeof logStudioErrorHandler>[0]);

		const logged = consoleSpy.mock.calls
			.map((call) => stripAnsi(call.join(' ')))
			.join('\n');
		expect(logged).toContain('An error occurred in the Studio:');
		expect(logged).toContain('RangeError');
		expect(logged).toContain('Invalid array length');
		expect(logged).toContain('at src/ErrorOnFrame10/index.tsx:5:8');
		expect(logged).toContain('if (frame === 10) {');
	} finally {
		consoleSpy.mockRestore();
	}
});

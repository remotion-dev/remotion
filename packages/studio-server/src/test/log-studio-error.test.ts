import {expect, spyOn, test} from 'bun:test';
import {stripAnsi} from '@remotion/studio-shared';
import {logStudioErrorHandler} from '../preview-server/routes/log-studio-error';

test('logStudioErrorHandler logs Studio frontend errors with a studio-frontend tag', async () => {
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

		expect(consoleSpy).toHaveBeenCalledTimes(1);

		const logged = stripAnsi(consoleSpy.mock.calls[0].join(' '));
		expect(logged).toContain('studio-frontend');
		expect(logged).toContain('TypeError: Cannot read properties of undefined');
		expect(logged).toContain('Component.tsx:1:1');
	} finally {
		consoleSpy.mockRestore();
	}
});

import {describe, expect, test} from 'bun:test';
import {
	resolveSetprivPathOnLinux,
	wrapExecutableWithSetprivIfAvailable,
} from '../linux/wrap-with-setpriv';

describe('wrap-with-setpriv', () => {
	test('returns executable + args array', () => {
		const r = wrapExecutableWithSetprivIfAvailable({
			executablePath: '/bin/sh',
			args: ['-c', 'true'],
		});
		expect(typeof r.executablePath).toBe('string');
		expect(Array.isArray(r.args)).toBe(true);
	});

	test('on non-linux, passes through unchanged', () => {
		if (process.platform === 'linux') {
			return;
		}

		const r = wrapExecutableWithSetprivIfAvailable({
			executablePath: '/bin/sh',
			args: ['-c', 'true'],
		});
		expect(r.executablePath).toBe('/bin/sh');
		expect(r.args).toEqual(['-c', 'true']);
		expect(resolveSetprivPathOnLinux()).toBe(null);
	});
});

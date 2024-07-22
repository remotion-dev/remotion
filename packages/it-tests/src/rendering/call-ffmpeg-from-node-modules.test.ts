import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {execSync} from 'child_process';
import path from 'path';

test('Should be able to call ffmpeg from node_modules (not officially supported)', async () => {
	const binary = RenderInternals.getExecutablePath({
		type: 'ffmpeg',
		indent: false,
		logLevel: 'info',
		binariesDirectory: null,
	});
	const a = execSync(`${binary} -buildconf`, {
		cwd: path.dirname(binary),
		stdio: 'pipe',
	});
	const output = a.toString('utf-8');
	expect(output.includes('--disable-decoders')).toBe(true);
});

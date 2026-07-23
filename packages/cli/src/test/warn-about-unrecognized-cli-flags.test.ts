import {describe, expect, spyOn, test} from 'bun:test';
import {Log} from '../log';
import {
	getUnrecognizedCliFlags,
	warnAboutUnrecognizedCliFlags,
} from '../warn-about-unrecognized-cli-flags';

describe('warn about unrecognized CLI flags', () => {
	test('allows flags recognized by render', () => {
		expect(
			getUnrecognizedCliFlags({
				args: [
					'render',
					'src/index.ts',
					'MyComp',
					'out.mp4',
					'--codec=h264',
					'--quiet',
					'--props',
					'./props.json',
				],
				command: 'render',
			}),
		).toEqual([]);
	});

	test('allows flags recognized by Studio', () => {
		expect(
			getUnrecognizedCliFlags({
				args: [
					'studio',
					'src/index.ts',
					'--port',
					'3001',
					'--no-open',
					'--concurrency=4',
					'--codec=h264',
					'--browser-executable=/path/to/browser',
					'--bundle-cache',
					'--output=out.mp4',
					'--quiet',
				],
				command: 'studio',
			}),
		).toEqual([]);
	});

	test('returns typos and flags for another command', () => {
		expect(
			getUnrecognizedCliFlags({
				args: [
					'studio',
					'--portt=3001',
					'--overwrite',
					'--height=1080',
					'--separate-audio-to=audio.wav',
				],
				command: 'studio',
			}),
		).toEqual(['portt', 'overwrite', 'height', 'separate-audio-to']);
	});

	test('returns render flags which are parsed but unused', () => {
		expect(
			getUnrecognizedCliFlags({
				args: ['render', '--browser=safari', '--force-new'],
				command: 'render',
			}),
		).toEqual(['browser', 'force-new']);
	});

	test('warns that the flag will fail in the future', () => {
		const warn = spyOn(Log, 'warn').mockImplementation(() => undefined);

		warnAboutUnrecognizedCliFlags({
			args: ['studio', '--width=1920'],
			command: 'studio',
			logLevel: 'info',
		});

		expect(warn).toHaveBeenCalledWith(
			{indent: false, logLevel: 'info'},
			'"--width" is not a valid flag for "npx remotion studio". This will fail in the future.',
		);
		warn.mockRestore();
	});
});

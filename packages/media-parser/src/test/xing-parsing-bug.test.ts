import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('Xing parsing bug - problematic MP3 files should parse successfully', async () => {
	const file1Path = '/tmp/test-mp3s/file1.mp3';
	const file2Path = '/tmp/test-mp3s/file2.mp3';

	// Test file 1 - should now parse successfully
	await parseMedia({
		src: file1Path,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
		},
		onDurationInSeconds: (duration) => {
			expect(typeof duration).toBe('number');
			expect(duration).toBeGreaterThan(0);
		},
	});

	// Test file 2 - should now parse successfully
	await parseMedia({
		src: file2Path,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		fields: {
			durationInSeconds: true,
		},
		onDurationInSeconds: (duration) => {
			expect(typeof duration).toBe('number');
			expect(duration).toBeGreaterThan(0);
		},
	});
});

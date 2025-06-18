import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../node';

test('Xing parsing bug - problematic MP3 files', async () => {
	const file1Path = '/tmp/test-mp3s/file1.mp3';
	const file2Path = '/tmp/test-mp3s/file2.mp3';

	// Test file 1
	try {
		await parseMedia({
			src: file1Path,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				durationInSeconds: true,
			},
		});
		console.log('File 1 parsed successfully');
	} catch (error) {
		console.log('File 1 error:', error.message);
		expect(error.message).toContain('xing header was parsed wrong');
	}

	// Test file 2
	try {
		await parseMedia({
			src: file2Path,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				durationInSeconds: true,
			},
		});
		console.log('File 2 parsed successfully');
	} catch (error) {
		console.log('File 2 error:', error.message);
		expect(error.message).toContain('xing header was parsed wrong');
	}
});
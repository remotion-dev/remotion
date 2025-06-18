import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('parse WAV with JUNK box type', async () => {
	// Test file from the issue that contains JUNK box
	// Downloaded from: https://remotion-video-submissions.s3.ap-northeast-1.amazonaws.com/f1f10e14-f82d-4a72-87bb-51127091319b
	const testFilePath = '/tmp/junk_test.wav';

	// This file has a JUNK chunk and uses WAVE_FORMAT_EXTENSIBLE (65534)
	// The test should fail on the audio format, not on the JUNK chunk
	let caughtError: Error | null = null;

	try {
		await parseMedia({
			src: testFilePath,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				container: true,
				audioCodec: true,
				tracks: true,
			},
		});
	} catch (error) {
		caughtError = error as Error;
	}

	// Should fail on audio format, not JUNK parsing
	expect(caughtError).not.toBeNull();
	expect(caughtError!.message).toContain(
		'Only supporting WAVE with PCM audio format, but got 65534',
	);
	expect(caughtError!.message).not.toContain('Unknown WAV box type JUNK');
});

test('should attempt to get all samples from JUNK WAV file', async () => {
	// This test demonstrates that we can parse past the JUNK chunk
	// and would get samples if the audio format was supported
	const testFilePath = '/tmp/junk_test.wav';

	let caughtError: Error | null = null;
	let sampleCount = 0;

	try {
		await parseMedia({
			src: testFilePath,
			reader: nodeReader,
			acknowledgeRemotionLicense: true,
			fields: {
				container: true,
				slowDurationInSeconds: true,
			},
			onAudioTrack: () => {
				return (_sample) => {
					sampleCount++;
				};
			},
		});
	} catch (error) {
		caughtError = error as Error;
	}

	// Should fail on audio format, not JUNK parsing
	expect(caughtError).not.toBeNull();
	expect(caughtError!.message).toContain(
		'Only supporting WAVE with PCM audio format, but got 65534',
	);
	expect(caughtError!.message).not.toContain('Unknown WAV box type JUNK');
	expect(sampleCount).toBe(0); // No samples because of unsupported format
});

import {ALL_FORMATS, AudioBufferSink, BlobSource, Input} from 'mediabunny';
import {expect, test} from 'vitest';
import {canRenderMediaOnWeb} from '../can-render-media-on-web';
import {renderMediaOnWeb} from '../render-media-on-web';
import {pitchShiftAudio} from './fixtures/pitch-shift-audio';
import '../symbol-dispose';

test('should resolve video codec for MP4/H264 configuration', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h264',
		width: 1920,
		height: 1080,
	});

	expect(result.resolvedVideoCodec).toBe('h264');
});

test('should resolve video codec for WebM/VP8 configuration', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'webm',
		videoCodec: 'vp8',
		width: 1280,
		height: 720,
	});

	expect(result.resolvedVideoCodec).toBe('vp8');
});

test('should return error for invalid codec/container combination', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'webm',
		videoCodec: 'h264', // H264 (AVC) is not supported in WebM
		width: 1920,
		height: 1080,
	});

	expect(result.canRender).toBe(false);
	const containerMismatchIssue = result.issues.find(
		(i) => i.type === 'container-codec-mismatch',
	);
	expect(containerMismatchIssue).toBeDefined();
	expect(containerMismatchIssue?.severity).toBe('error');
});

test('should adjust odd H264 dimensions', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h264',
		width: 1921, // Odd width
		height: 1080,
	});

	const dimensionIssue = result.issues.find(
		(i) => i.type === 'invalid-dimensions',
	);
	expect(dimensionIssue).toBeUndefined();
});

test('should adjust odd H265 dimensions', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h265',
		width: 1920,
		height: 1081, // Odd height
	});

	const dimensionIssue = result.issues.find(
		(i) => i.type === 'invalid-dimensions',
	);
	expect(dimensionIssue).toBeUndefined();
});

test('should allow VP8 with odd dimensions', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'webm',
		videoCodec: 'vp8',
		width: 1921,
		height: 1081,
	});

	const dimensionIssue = result.issues.find(
		(i) => i.type === 'invalid-dimensions',
	);
	expect(dimensionIssue).toBeUndefined();
});

test('should return error for transparent video with H264', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h264',
		width: 1920,
		height: 1080,

		transparent: true,
	});

	expect(result.canRender).toBe(false);
	const transparentIssue = result.issues.find(
		(i) => i.type === 'transparent-video-unsupported',
	);
	expect(transparentIssue).toBeDefined();
	expect(transparentIssue?.severity).toBe('error');
});

test('should allow transparent video with VP9', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'webm',
		videoCodec: 'vp9',
		width: 1920,
		height: 1080,

		transparent: true,
	});

	const transparentIssue = result.issues.find(
		(i) => i.type === 'transparent-video-unsupported',
	);
	expect(transparentIssue).toBeUndefined();
});

test('should skip audio checks when muted', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h264',
		width: 1920,
		height: 1080,

		muted: true,
	});

	expect(result.resolvedAudioCodec).toBeNull();
	const audioIssue = result.issues.find(
		(i) => i.type === 'audio-codec-unsupported',
	);
	expect(audioIssue).toBeUndefined();
});

test('should use default codecs when not specified', async () => {
	const result = await canRenderMediaOnWeb({
		width: 1920,
		height: 1080,
	});

	// Default container is mp4, default video codec for mp4 is h264
	expect(result.resolvedVideoCodec).toBe('h264');
});

test('should use default WebM codecs', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'webm',
		width: 1920,
		height: 1080,
	});

	// Default video codec for webm is vp8
	expect(result.resolvedVideoCodec).toBe('vp8');
});

test('should resolve videoCodec to null for WAV container', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'wav',
		width: 1920,
		height: 1080,
	});

	expect(result.resolvedVideoCodec).toBeNull();
	expect(result.resolvedAudioCodec).toBe('pcm-s16');
});

test('should resolve videoCodec to null for MP3 container', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp3',
		width: 1920,
		height: 1080,
	});

	expect(result.resolvedVideoCodec).toBeNull();
});

test('should resolve videoCodec to null for OGG container', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'ogg',
		width: 1920,
		height: 1080,
	});

	expect(result.resolvedVideoCodec).toBeNull();
});

test('should not report video issues for audio-only containers', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'wav',
		width: 1920,
		height: 1080,
	});

	const videoIssues = result.issues.filter(
		(i) =>
			i.type === 'video-codec-unsupported' ||
			i.type === 'container-codec-mismatch' ||
			i.type === 'transparent-video-unsupported' ||
			i.type === 'invalid-dimensions' ||
			i.type === 'webcodecs-unavailable' ||
			i.type === 'webgl-unsupported',
	);
	expect(videoIssues).toHaveLength(0);
});

test('audio-only readiness agrees with an actual PCM export', async () => {
	const capability = await canRenderMediaOnWeb({
		container: 'wav',
		audioCodec: 'pcm-s16',
		width: pitchShiftAudio.width,
		height: pitchShiftAudio.height,
		outputTarget: 'arraybuffer',
	});
	const result = await renderMediaOnWeb({
		licenseKey: 'free-license',
		composition: {...pitchShiftAudio, calculateMetadata: null},
		frameRange: [50, 50],
		container: 'wav',
		audioCodec: 'pcm-s16',
		sampleRate: 48000,
		outputTarget: 'arraybuffer',
	});
	using input = new Input({
		formats: ALL_FORMATS,
		source: new BlobSource(await result.getBlob()),
	});
	const track = await input.getPrimaryAudioTrack();
	expect(track).not.toBeNull();
	let totalSamples = 0;
	let wrongSamples = 0;
	for await (const {buffer} of new AudioBufferSink(track!).buffers()) {
		expect(buffer.sampleRate).toBe(48000);
		expect(buffer.numberOfChannels).toBe(2);
		for (let channel = 0; channel < 2; channel++) {
			const audio = buffer.getChannelData(channel);
			for (let sample = 0; sample < audio.length; sample++) {
				const sourceSample = 8000 + totalSamples + sample;
				const expected =
					Math.round(
						Math.sin(
							(sourceSample / 48000) *
								(channel === 0 ? 440 : 660) *
								Math.PI *
								2,
						) * 10000,
					) / 32768;
				if (audio[sample] !== expected) wrongSamples++;
			}
		}

		totalSamples += buffer.length;
	}

	expect(totalSamples).toBe(1600);
	expect(wrongSamples).toBe(0);
	expect(capability.resolvedVideoCodec).toBeNull();
	expect(capability.resolvedAudioCodec).toBe('pcm-s16');
	expect(
		capability.issues.filter((issue) => issue.type === 'webgl-unsupported'),
	).toHaveLength(0);
	expect(capability.canRender).toBe(true);
});

test('should accept videoCodec: null for audio-only containers', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'wav',
		videoCodec: null,
		width: 1920,
		height: 1080,
	});

	expect(result.resolvedVideoCodec).toBeNull();
	expect(result.canRender).toBe(true);
});

test('should render MKV with default video codec', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mkv',
		width: 1920,
		height: 1080,
	});

	expect(result.resolvedVideoCodec).toBe('h264');
});

test('should auto-detect outputTarget when null is passed', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h264',
		width: 1920,
		height: 1080,
		outputTarget: null,
	});

	expect(['web-fs', 'arraybuffer']).toContain(result.resolvedOutputTarget);
});

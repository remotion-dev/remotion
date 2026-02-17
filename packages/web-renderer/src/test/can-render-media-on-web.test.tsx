import {expect, test} from 'vitest';
import {canRenderMediaOnWeb} from '../can-render-media-on-web';
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

test('should return error for H264 with odd dimensions', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h264',
		width: 1921, // Odd width
		height: 1080,
	});

	expect(result.canRender).toBe(false);
	const dimensionIssue = result.issues.find(
		(i) => i.type === 'invalid-dimensions',
	);
	expect(dimensionIssue).toBeDefined();
	expect(dimensionIssue?.severity).toBe('error');
	expect(dimensionIssue?.message).toContain('1921x1080');
});

test('should return error for H265 with odd dimensions', async () => {
	const result = await canRenderMediaOnWeb({
		container: 'mp4',
		videoCodec: 'h265',
		width: 1920,
		height: 1081, // Odd height
	});

	expect(result.canRender).toBe(false);
	const dimensionIssue = result.issues.find(
		(i) => i.type === 'invalid-dimensions',
	);
	expect(dimensionIssue).toBeDefined();
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

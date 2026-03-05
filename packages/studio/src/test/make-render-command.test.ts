import {expect, test} from 'bun:test';
import type {RenderDefaults} from '@remotion/studio-shared';
import {
	getNpmRemotionCommandPrefix,
	makeReadOnlyStudioRenderCommand,
	normalizeServeUrlForRenderCommand,
} from '../helpers/make-render-command';

const getDefaults = (): RenderDefaults => {
	return {
		jpegQuality: 80,
		scale: 1,
		logLevel: 'info',
		codec: 'h264',
		concurrency: 4,
		minConcurrency: 1,
		muted: false,
		maxConcurrency: 8,
		stillImageFormat: 'png',
		videoImageFormat: 'jpeg',
		audioCodec: null,
		enforceAudioTrack: false,
		proResProfile: null,
		x264Preset: 'medium',
		pixelFormat: 'yuv420p',
		audioBitrate: null,
		videoBitrate: null,
		encodingBufferSize: null,
		encodingMaxRate: null,
		userAgent: null,
		everyNthFrame: 1,
		numberOfGifLoops: null,
		delayRenderTimeout: 30000,
		disableWebSecurity: false,
		openGlRenderer: null,
		ignoreCertificateErrors: false,
		mediaCacheSizeInBytes: null,
		offthreadVideoCacheSizeInBytes: null,
		offthreadVideoThreads: null,
		headless: true,
		colorSpace: 'default',
		multiProcessOnLinux: false,
		darkMode: false,
		beepOnFinish: false,
		repro: false,
		forSeamlessAacConcatenation: false,
		metadata: null,
		hardwareAcceleration: 'if-possible',
		chromeMode: 'headless-shell',
		publicLicenseKey: null,
		outputLocation: null,
	};
};

test('Should map to npm-based command prefix', () => {
	expect(getNpmRemotionCommandPrefix('4.0.431')).toBe(
		'npx -p @remotion/cli@4.0.431 remotion',
	);
	expect(getNpmRemotionCommandPrefix('')).toBe('npx -p @remotion/cli remotion');
});

test('Should normalize serve URL by stripping selected composition', () => {
	expect(
		normalizeServeUrlForRenderCommand({
			locationHref: 'http://localhost:63389/?/still-helloworld',
			compositionId: 'still-helloworld',
		}),
	).toBe('http://localhost:63389');
	expect(
		normalizeServeUrlForRenderCommand({
			locationHref: 'https://example.com/base-path/still-helloworld',
			compositionId: 'still-helloworld',
		}),
	).toBe('https://example.com/base-path');
});

test('Should generate concise read-only render command and omit concurrency', () => {
	const command = makeReadOnlyStudioRenderCommand({
		remotionVersion: '4.0.431',
		locationHref: 'https://example.com/dynamic-length',
		compositionId: 'dynamic-length',
		renderMode: 'video',
		renderDefaults: getDefaults(),
		durationInFrames: 200,
		frame: 0,
		startFrame: 10,
		endFrame: 80,
		stillImageFormat: 'png',
		sequenceImageFormat: 'png',
		videoImageFormat: 'jpeg',
		codec: 'h264',
		muted: true,
		enforceAudioTrack: false,
		proResProfile: null,
		x264Preset: 'medium',
		pixelFormat: 'yuv420p',
		colorSpace: 'default',
		scale: 1,
		logLevel: 'info',
		delayRenderTimeout: 30000,
		hardwareAcceleration: 'if-possible',
		chromeMode: 'headless-shell',
		inputProps: {
			title: "It's me",
		},
	});

	expect(command).toContain(
		"npx -p @remotion/cli@4.0.431 remotion render 'https://example.com' 'dynamic-length'",
	);
	expect(command).toContain("--frames='10-80'");
	expect(command).toContain('--muted');
	expect(command).toContain("It'\\''s me");
	expect(command).not.toContain('--concurrency=');
});

test('Should generate still command and omit default flags', () => {
	const command = makeReadOnlyStudioRenderCommand({
		remotionVersion: '4.0.431',
		locationHref: 'https://example.com/still',
		compositionId: 'StillComp',
		renderMode: 'still',
		renderDefaults: getDefaults(),
		durationInFrames: 120,
		frame: 12,
		startFrame: 0,
		endFrame: 119,
		stillImageFormat: 'png',
		sequenceImageFormat: 'png',
		videoImageFormat: 'jpeg',
		codec: 'h264',
		muted: false,
		enforceAudioTrack: false,
		proResProfile: null,
		x264Preset: 'medium',
		pixelFormat: 'yuv420p',
		colorSpace: 'default',
		scale: 1,
		logLevel: 'info',
		delayRenderTimeout: 30000,
		hardwareAcceleration: 'if-possible',
		chromeMode: 'headless-shell',
		inputProps: {
			message: 'Hello',
		},
	});

	expect(command).toContain(
		"npx -p @remotion/cli@4.0.431 remotion still 'https://example.com/still' 'StillComp'",
	);
	expect(command).toContain("--frame='12'");
	expect(command).not.toContain("--image-format='png'");
	expect(command).not.toContain('--codec=');
	expect(command).not.toContain('--frames=');
});

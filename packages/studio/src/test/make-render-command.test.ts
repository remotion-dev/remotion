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

const getBaseInput = (): Parameters<
	typeof makeReadOnlyStudioRenderCommand
>[0] => {
	return {
		remotionVersion: '4.0.431',
		locationHref: 'https://example.com/base',
		compositionId: 'Comp',
		outName: 'out/video.mp4',
		renderMode: 'video',
		renderDefaults: getDefaults(),
		durationInFrames: 120,
		concurrency: 4,
		frame: 0,
		startFrame: 0,
		endFrame: 119,
		stillImageFormat: 'png',
		sequenceImageFormat: 'png',
		videoImageFormat: 'jpeg',
		jpegQuality: 80,
		codec: 'h264',
		muted: false,
		enforceAudioTrack: false,
		proResProfile: null,
		x264Preset: 'medium',
		pixelFormat: 'yuv420p',
		crf: null,
		videoBitrate: null,
		audioBitrate: null,
		audioCodec: 'aac',
		everyNthFrame: 1,
		numberOfGifLoops: null,
		disallowParallelEncoding: false,
		encodingBufferSize: null,
		encodingMaxRate: null,
		forSeamlessAacConcatenation: false,
		separateAudioTo: null,
		colorSpace: 'default',
		scale: 1,
		logLevel: 'info',
		delayRenderTimeout: 30000,
		hardwareAcceleration: 'if-possible',
		chromeMode: 'headless-shell',
		headless: true,
		disableWebSecurity: false,
		ignoreCertificateErrors: false,
		gl: null,
		userAgent: null,
		multiProcessOnLinux: false,
		darkMode: false,
		offthreadVideoCacheSizeInBytes: null,
		offthreadVideoThreads: null,
		mediaCacheSizeInBytes: null,
		beepOnFinish: false,
		repro: false,
		metadata: null,
		envVariables: {},
		inputProps: {},
	};
};

test('Should map to npm-based command prefix', () => {
	expect(getNpmRemotionCommandPrefix('4.0.431')).toBe(
		'bunx --yes --location=global -p @remotion/cli@4.0.431 remotion',
	);
	expect(getNpmRemotionCommandPrefix('')).toBe(
		'bunx --yes --location=global -p @remotion/cli remotion',
	);
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
		...getBaseInput(),
		locationHref: 'https://example.com/dynamic-length',
		compositionId: 'dynamic-length',
		outName: 'out/video.mp4',
		durationInFrames: 200,
		startFrame: 10,
		endFrame: 80,
		muted: true,
		crf: 19,
		inputProps: {
			title: "It's me",
		},
	});

	expect(command).toContain(
		"bunx --yes --location=global -p @remotion/cli@4.0.431 remotion render 'https://example.com' 'dynamic-length' 'video.mp4'",
	);
	expect(command).toContain("--frames='10-80'");
	expect(command).toContain('--muted');
	expect(command).toContain("--crf='19'");
	expect(command).toContain("It'\\''s me");
	expect(command).not.toContain('--concurrency=');
});

test('Should generate still command and omit default flags', () => {
	const command = makeReadOnlyStudioRenderCommand({
		...getBaseInput(),
		locationHref: 'https://example.com/still',
		compositionId: 'StillComp',
		outName: 'out/still.png',
		renderMode: 'still',
		frame: 12,
		inputProps: {
			message: 'Hello',
		},
	});

	expect(command).toContain(
		"bunx --yes --location=global -p @remotion/cli@4.0.431 remotion still 'https://example.com/still' 'StillComp' 'still.png'",
	);
	expect(command).toContain("--frame='12'");
	expect(command).not.toContain("--image-format='png'");
	expect(command).not.toContain('--codec=');
	expect(command).not.toContain('--frames=');
});

test('Should include custom bitrate and audio codec flags', () => {
	const command = makeReadOnlyStudioRenderCommand({
		...getBaseInput(),
		locationHref: 'https://example.com/my-comp',
		compositionId: 'my-comp',
		outName: 'out/custom.mp4',
		videoBitrate: '6M',
		audioBitrate: '256K',
		audioCodec: 'mp3',
	});

	expect(command).toContain("--video-bitrate='6M'");
	expect(command).toContain("--audio-bitrate='256K'");
	expect(command).toContain("--audio-codec='mp3'");
});

test('Should include advanced flags and env variables', () => {
	const command = makeReadOnlyStudioRenderCommand({
		...getBaseInput(),
		outName: 'out/advanced.mp4',
		concurrency: 6,
		disallowParallelEncoding: true,
		encodingBufferSize: '10000k',
		encodingMaxRate: '5000k',
		forSeamlessAacConcatenation: true,
		separateAudioTo: 'out/advanced.aac',
		disableWebSecurity: true,
		ignoreCertificateErrors: true,
		headless: false,
		gl: 'vulkan',
		userAgent: 'Mozilla/5.0 (Remotion)',
		multiProcessOnLinux: true,
		darkMode: true,
		offthreadVideoCacheSizeInBytes: 536870912,
		offthreadVideoThreads: 2,
		mediaCacheSizeInBytes: 1000000000,
		beepOnFinish: true,
		repro: true,
		metadata: {artist: 'Remotion'},
		envVariables: {FOO: 'bar'},
	});

	expect(command).toContain("env 'FOO=bar'");
	expect(command).toContain("--concurrency='6'");
	expect(command).toContain('--disallow-parallel-encoding');
	expect(command).toContain("--buffer-size='10000k'");
	expect(command).toContain("--max-rate='5000k'");
	expect(command).toContain('--for-seamless-aac-concatenation');
	expect(command).toContain("--separate-audio-to='out/advanced.aac'");
	expect(command).toContain('--disable-web-security');
	expect(command).toContain('--ignore-certificate-errors');
	expect(command).toContain('--disable-headless');
	expect(command).toContain("--gl='vulkan'");
	expect(command).toContain("--user-agent='Mozilla/5.0 (Remotion)'");
	expect(command).toContain('--enable-multiprocess-on-linux');
	expect(command).toContain('--dark-mode');
	expect(command).toContain("--offthreadvideo-cache-size-in-bytes='536870912'");
	expect(command).toContain("--offthreadvideo-video-threads='2'");
	expect(command).toContain("--media-cache-size-in-bytes='1000000000'");
	expect(command).toContain('--beep-on-finish');
	expect(command).toContain('--repro');
	expect(command).toContain("--metadata='artist=Remotion'");
});

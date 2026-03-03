import {expect, test} from 'bun:test';
import type {RenderDefaults} from '@remotion/studio-shared';
import {
	getRemotionCommandPrefix,
	makeRenderCommand,
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

test('Should map package manager to command prefix', () => {
	expect(getRemotionCommandPrefix('bun')).toBe('bunx remotion');
	expect(getRemotionCommandPrefix('pnpm')).toBe('pnpm exec remotion');
	expect(getRemotionCommandPrefix('yarn')).toBe('yarn remotion');
	expect(getRemotionCommandPrefix('npm')).toBe('npx remotion');
	expect(getRemotionCommandPrefix('unknown')).toBe('npx remotion');
});

test('Should generate a render command with escaped props and flags', () => {
	const command = makeRenderCommand({
		commandType: 'render',
		packageManager: 'npm',
		serveUrl: 'https://example.com/hello',
		compositionId: 'MyComp',
		inputProps: {
			title: "It's me",
		},
		renderDefaults: {
			...getDefaults(),
			scale: 2,
			muted: true,
			openGlRenderer: 'angle',
			headless: false,
			disableWebSecurity: true,
		},
		inFrameMark: 5,
		outFrameMark: 25,
		frame: 0,
	});

	expect(command).toContain(
		"npx remotion render 'https://example.com/hello' 'MyComp'",
	);
	expect(command).toContain("--frames='5-25'");
	expect(command).toContain('--muted');
	expect(command).toContain('--disable-web-security');
	expect(command).toContain('--disable-headless');
	expect(command).toContain("--scale='2'");
	expect(command).toContain("--gl='angle'");
	expect(command).toContain("It'\\''s me");
});

test('Should generate a still command without render-only flags', () => {
	const command = makeRenderCommand({
		commandType: 'still',
		packageManager: 'bun',
		serveUrl: 'https://example.com/still',
		compositionId: 'StillComp',
		inputProps: {
			message: 'Hello',
		},
		renderDefaults: getDefaults(),
		inFrameMark: 10,
		outFrameMark: 20,
		frame: 12,
	});

	expect(command).toContain(
		"bunx remotion still 'https://example.com/still' 'StillComp'",
	);
	expect(command).toContain("--frame='12'");
	expect(command).toContain("--image-format='png'");
	expect(command).not.toContain('--codec=');
	expect(command).not.toContain('--frames=');
});

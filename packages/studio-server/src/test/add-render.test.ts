import {expect, test} from 'bun:test';
import type {
	AddRenderRequest,
	RenderJobWithCleanup,
} from '@remotion/studio-shared';
import {handleAddRender} from '../preview-server/routes/add-render';

test('captures the current public license key for Studio renders', async () => {
	const addedJobs: RenderJobWithCleanup[] = [];
	const addRender = (input: AddRenderRequest) =>
		handleAddRender({
			binariesDirectory: null,
			configFile: null,
			entryPoint: '',
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			input,
			logLevel: 'error',
			methods: {
				addJob: ({job}) => addedJobs.push(job),
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '',
			remotionRoot: '',
			request: {} as never,
			response: {} as never,
		});
	const common = {
		compositionId: 'comp',
		outName: 'out',
		chromiumOptions: {
			darkMode: false,
			disableWebSecurity: false,
			enableMultiProcessOnLinux: true,
			gl: null,
			headless: true,
			ignoreCertificateErrors: false,
			userAgent: null,
		},
		delayRenderTimeout: 30000,
		envVariables: {},
		serializedInputPropsWithCustomSchema: '{}',
		offthreadVideoCacheSizeInBytes: null,
		offthreadVideoThreads: null,
		preferredEffectBackend: 'auto' as const,
		mediaCacheSizeInBytes: null,
		multiProcessOnLinux: true,
		beepOnFinish: false,
		metadata: null,
	};

	for (const licenseKey of ['rm_pub_first', 'free-license']) {
		await addRender({
			...common,
			type: 'video',
			licenseKey,
			outName: 'out.mp4',
			codec: 'h264',
			audioCodec: 'aac',
			imageFormat: 'jpeg',
			jpegQuality: 80,
			scale: 1,
			logLevel: 'error',
			concurrency: 1,
			crf: 18,
			gopSize: null,
			startFrame: 0,
			endFrame: 29,
			muted: false,
			enforceAudioTrack: false,
			proResProfile: null,
			x264Preset: null,
			pixelFormat: 'yuv420p',
			audioBitrate: null,
			videoBitrate: null,
			encodingBufferSize: null,
			encodingMaxRate: null,
			everyNthFrame: 1,
			numberOfGifLoops: null,
			disallowParallelEncoding: false,
			colorSpace: 'bt709',
			repro: false,
			forSeamlessAacConcatenation: false,
			separateAudioTo: null,
			hardwareAcceleration: 'disable',
			chromeMode: 'headless-shell',
			sampleRate: 48000,
			prerenderTarget: null,
		});
		await addRender({
			...common,
			type: 'still',
			licenseKey,
			outName: 'out.png',
			imageFormat: 'png',
			jpegQuality: 80,
			frame: 0,
			scale: 1,
			logLevel: 'error',
			chromeMode: 'headless-shell',
		});
	}

	expect(
		addedJobs.map((job) =>
			job.type === 'video' || job.type === 'still' ? job.licenseKey : null,
		),
	).toEqual(['rm_pub_first', 'rm_pub_first', 'free-license', 'free-license']);
});

test('resolves pre-render outputs inside the public folder', async () => {
	const addedJobs: RenderJobWithCleanup[] = [];
	const addRender = (outName: string) =>
		handleAddRender({
			binariesDirectory: null,
			configFile: null,
			entryPoint: '',
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			input: {
				compositionId: 'Catalog',
				outName,
				chromiumOptions: {
					darkMode: false,
					disableWebSecurity: false,
					enableMultiProcessOnLinux: true,
					gl: null,
					headless: true,
					ignoreCertificateErrors: false,
					userAgent: null,
				},
				delayRenderTimeout: 30000,
				envVariables: {},
				serializedInputPropsWithCustomSchema: '{}',
				offthreadVideoCacheSizeInBytes: null,
				offthreadVideoThreads: null,
				preferredEffectBackend: 'auto',
				mediaCacheSizeInBytes: null,
				multiProcessOnLinux: true,
				beepOnFinish: false,
				metadata: null,
				type: 'video',
				licenseKey: null,
				codec: 'h264',
				audioCodec: 'aac',
				imageFormat: 'jpeg',
				jpegQuality: 80,
				scale: 1,
				logLevel: 'error',
				concurrency: 1,
				crf: null,
				gopSize: null,
				startFrame: 0,
				endFrame: 29,
				muted: false,
				enforceAudioTrack: false,
				proResProfile: null,
				x264Preset: null,
				pixelFormat: 'yuv420p',
				audioBitrate: null,
				videoBitrate: null,
				encodingBufferSize: null,
				encodingMaxRate: null,
				everyNthFrame: 1,
				numberOfGifLoops: null,
				disallowParallelEncoding: false,
				colorSpace: 'default',
				repro: false,
				forSeamlessAacConcatenation: false,
				separateAudioTo: null,
				hardwareAcceleration: 'disable',
				chromeMode: 'headless-shell',
				sampleRate: 48000,
				prerenderTarget: {
					fileName: 'src/Main.tsx',
					nodePath: [0],
					width: 1080,
					height: 1920,
					fps: 25,
					durationInFrames: 30,
				},
			},
			logLevel: 'error',
			methods: {
				addJob: ({job}) => addedJobs.push(job),
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir: '/project/static',
			remotionRoot: '/project',
			request: {} as never,
			response: {} as never,
		});

	await addRender('prerendered/Catalog.mp4');
	const [prerenderJob] = addedJobs;
	expect(prerenderJob.outName).toBe('static/prerendered/Catalog.mp4');
	expect(prerenderJob.type === 'video' ? prerenderJob.prerender : null).toEqual(
		{
			fileName: 'src/Main.tsx',
			nodePath: [0],
			src: 'prerendered/Catalog.mp4',
			width: 1080,
			height: 1920,
			fps: 25,
			durationInFrames: 30,
		},
	);

	expect(() => addRender('../escape.mp4')).toThrow(
		'Pre-rendered videos must be saved in the public folder',
	);
});

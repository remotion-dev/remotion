import {expect, test} from 'bun:test';
import type {
	AddRenderRequest,
	RenderJobWithCleanup,
} from '@remotion/studio-shared';
import {handleAddRender} from '../preview-server/routes/add-render';

test('captures the current public license key for a Studio video render', async () => {
	const addedJobs: RenderJobWithCleanup[] = [];

	for (const licenseKey of ['rm_pub_first', 'free-license']) {
		await handleAddRender({
			binariesDirectory: null,
			configFile: null,
			entryPoint: '',
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
			input: {
				type: 'video',
				licenseKey,
				compositionId: 'comp',
				outName: 'out.mp4',
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
				mediaCacheSizeInBytes: null,
				multiProcessOnLinux: true,
				beepOnFinish: false,
				metadata: null,
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
			} satisfies AddRenderRequest,
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
	}

	expect(
		addedJobs.map((job) => (job.type === 'video' ? job.licenseKey : null)),
	).toEqual(['rm_pub_first', 'free-license']);
});

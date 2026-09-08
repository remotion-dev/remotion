import {afterEach, expect, mock, test} from 'bun:test';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import type {ContextType} from 'react';
import {RenderQueueContext} from '../components/RenderQueue/context';
import type {VideoMattingJob} from '../components/RenderQueue/video-matting-job-types';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

const calls: string[] = [];
let processJob: ((job: VideoMattingJob) => Promise<void>) | null = null;

mock.module('@remotion/video-matting', () => ({
	canUseVideoMatting: () => Promise.resolve({supported: true}),
	isVideoMattingModelCached: () => Promise.resolve(false),
	loadVideoMattingModel: ({
		onProgress,
	}: {
		onProgress: (progress: {progress: number}) => void;
	}) => {
		calls.push('load-model');
		onProgress({progress: 1});
		return Promise.resolve({alreadyLoaded: false});
	},
	separateVideoLayers: ({
		onProgress,
	}: {
		onProgress: (progress: {
			stage: string;
			progress: number;
			processedFrames: number;
		}) => void;
	}) => {
		calls.push('separate');
		onProgress({stage: 'processing', progress: 0.5, processedFrames: 42});
		return Promise.resolve({
			base: {
				getBlob: () => Promise.resolve(new Blob(['base'])),
				dispose: () => Promise.resolve(),
			},
			foreground: {
				getBlob: () => Promise.resolve(new Blob(['foreground'])),
				dispose: () => Promise.resolve(),
			},
		});
	},
	disposeVideoMattingModel: () => {
		calls.push('dispose-model');
		return Promise.resolve();
	},
}));

afterEach(() => {
	cleanup();
	calls.length = 0;
	processJob = null;
});

test('loads the model, separates the layers and writes both outputs', async () => {
	const originalBrowserStudio = Object.getOwnPropertyDescriptor(
		window,
		'remotion_browserStudio',
	);
	Object.defineProperty(window, 'remotion_browserStudio', {
		configurable: true,
		value: makeBrowserStudioOperations({
			writeStaticFile: ({filePath}) => {
				calls.push(`write:${filePath}`);
				return Promise.resolve();
			},
		}),
	});
	const progress: string[] = [];
	let done = false;
	let failed: Error | null = null;
	const value = {
		setProcessVideoMattingJobCallback: (callback: typeof processJob) => {
			processJob = callback;
		},
		updateVideoMattingJobProgress: (_id: string, update: {message: string}) => {
			progress.push(update.message);
		},
		markVideoMattingJobDone: () => {
			done = true;
		},
		markVideoMattingJobFailed: (_id: string, error: Error) => {
			failed = error;
		},
	} as unknown as ContextType<typeof RenderQueueContext>;

	const {VideoMattingQueueProcessor} =
		await import('../components/RenderQueue/VideoMattingQueueProcessor');
	render(
		<RenderQueueContext.Provider value={value}>
			<VideoMattingQueueProcessor />
		</RenderQueueContext.Provider>,
	);
	await waitFor(() => expect(processJob).not.toBeNull());

	await act(() =>
		processJob?.({
			id: 'matting-1',
			type: 'video-matting',
			status: 'idle',
			startedAt: 1,
			src: '/input.webm',
			displayName: 'input.webm',
			baseOutName: 'input-base.webm',
			foregroundOutName: 'input-foreground.webm',
			model: 'modnet',
			audio: 'base',
			videoBitrate: 'very-high',
		}),
	);

	expect(failed).toBeNull();
	expect(done).toBe(true);
	expect(calls).toEqual([
		'load-model',
		'separate',
		'write:input-base.webm',
		'write:input-foreground.webm',
		'dispose-model',
	]);
	expect(progress).toContain('Downloading modnet 100%');
	expect(progress).toContain('Processed 42 frames · 50%');
	if (originalBrowserStudio) {
		Object.defineProperty(
			window,
			'remotion_browserStudio',
			originalBrowserStudio,
		);
	} else {
		Reflect.deleteProperty(window, 'remotion_browserStudio');
	}
});

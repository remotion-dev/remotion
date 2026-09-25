import {afterEach, expect, mock, test} from 'bun:test';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import type {ContextType} from 'react';
import {RenderQueueContext} from '../components/RenderQueue/context';
import type {
	VideoMattingJob,
	VideoMattingJobProgress,
} from '../components/RenderQueue/video-matting-job-types';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

const calls: string[] = [];
let processJob: ((job: VideoMattingJob) => Promise<void>) | null = null;

mock.module('@remotion/video-matting', () => ({
	canUseVideoMatting: () => Promise.resolve({supported: true}),
	isVideoMattingModelCached: () => Promise.resolve(false),
	downloadVideoMattingModel: ({
		onProgress,
	}: {
		onProgress: (progress: {progress: number}) => void;
	}) => {
		calls.push('download-model');
		onProgress({progress: 1});
		return Promise.resolve({alreadyDownloaded: false});
	},
	loadVideoMattingModel: () => {
		calls.push('load-model');
		return Promise.resolve({alreadyLoaded: false});
	},
	VideoMattingInternals: {
		removeVideoBackground: ({
			onProgress,
		}: {
			onProgress: (progress: {
				stage: string;
				progress: number;
				processedFrames: number;
			}) => void;
		}) => {
			calls.push('remove-background');
			onProgress({stage: 'processing', progress: 0.5, processedFrames: 42});
			return Promise.resolve({
				video: {
					getBlob: () => Promise.resolve(new Blob(['video'])),
					dispose: () => Promise.resolve(),
				},
			});
		},
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

test('writes the transparent video and replaces the selected video source', async () => {
	const originalBrowserStudio = Object.getOwnPropertyDescriptor(
		window,
		'remotion_browserStudio',
	);
	Object.defineProperty(window, 'remotion_browserStudio', {
		configurable: true,
		value: makeBrowserStudioOperations({
			replaceVideoSource: ({src, fileName, nodePath}) => {
				calls.push(`replace:${fileName}:${nodePath.join('.')}:${src}`);
				return Promise.resolve({
					success: true,
					nodePathMutation: {} as never,
				});
			},
			writeStaticFile: ({filePath}) => {
				calls.push(`write:${filePath}`);
				return Promise.resolve();
			},
		}),
	});
	const progress: VideoMattingJobProgress[] = [];
	let done = false;
	let failed: Error | null = null;
	const value = {
		getAbortController: () => new AbortController(),
		setProcessVideoMattingJobCallback: (callback: typeof processJob) => {
			processJob = callback;
		},
		updateVideoMattingJobProgress: (
			_id: string,
			update: VideoMattingJobProgress,
		) => {
			progress.push(update);
		},
		markVideoMattingJobDone: () => {
			done = true;
		},
		markVideoMattingJobSaving: () => undefined,
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
			outName: 'input-no-background.webm',
			model: 'modnet',
			audio: 'keep',
			target: {
				fileName: '/project/Composition.tsx',
				nodePath: {
					absolutePath: '/project/Composition.tsx',
					effectKeys: [],
					nodePath: ['Comp', 0],
					sequenceKeys: [],
					videoConfigValues: null,
				},
			},
			videoBitrate: 'very-high',
		}),
	);

	expect(failed).toBeNull();
	expect(done).toBe(true);
	expect(calls).toEqual([
		'download-model',
		'load-model',
		'remove-background',
		'write:input-no-background.webm',
		'replace:/project/Composition.tsx:Comp.0:input-no-background.webm',
		'dispose-model',
	]);
	expect(progress).toContainEqual({
		detail: null,
		message: 'Downloading modnet 100%',
		value: 0.2,
	});
	expect(progress).toContainEqual({
		detail: 'Processed 42 frames · 50%',
		message: 'Removing background...',
		value: 0.525,
	});
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

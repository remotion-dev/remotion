import {afterEach, expect, spyOn, test} from 'bun:test';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import type {SetStateAction} from 'react';
import type {CanvasContent} from 'remotion';
import {Internals} from 'remotion';
import type {CaptionJob} from '../components/RenderQueue/caption-job-types';
import {CaptionQueueItem} from '../components/RenderQueue/CaptionQueueItem';
import {RenderQueueContext} from '../components/RenderQueue/context';
import {RendersTab} from '../components/RendersTab';
import {FolderContextProvider} from '../state/folders';

afterEach(cleanup);

const renderWithCaptionJob = (job: CaptionJob) => {
	let canvasContent: CanvasContent | null = null;
	render(
		<Internals.CompositionSetters.Provider
			value={
				{
					setCanvasContent: (value: SetStateAction<CanvasContent | null>) => {
						canvasContent =
							typeof value === 'function' ? value(canvasContent) : value;
					},
				} as never
			}
		>
			<FolderContextProvider>
				<RenderQueueContext.Provider
					value={
						{
							jobs: [],
							captionJobs: [job],
						} as never
					}
				>
					<>
						<RendersTab selected={false} onClick={() => undefined} />
						<CaptionQueueItem job={job} selected={false} />
					</>
				</RenderQueueContext.Provider>
			</FolderContextProvider>
		</Internals.CompositionSetters.Provider>,
	);

	return {getCanvasContent: () => canvasContent};
};

const baseJob = {
	id: 'caption-job',
	type: 'caption',
	startedAt: 0,
	src: '/audio.mp3',
	displayName: 'audio.mp3',
	audioStreamIndex: null,
	requestInit: null,
	outName: 'dialogue-captions.json',
	model: 'tiny.en',
	language: null,
	chunkLengthInSeconds: 30,
	strideLengthInSeconds: 5,
	task: 'transcribe',
	forceFullSequences: false,
	doSample: false,
	temperature: 1,
	topK: 50,
	repetitionPenalty: 1,
	noRepeatNgramSize: 0,
} as const;

test('labels the renders tab as Jobs while a caption job is running', () => {
	renderWithCaptionJob({
		...baseJob,
		status: 'running',
		progress: {
			message: 'Downloading tiny.en… · 50% · 57.1 MB / 114.2 MB',
			value: 0.165,
		},
	});

	expect(screen.getByText('Jobs')).toBeTruthy();
	expect(screen.getByText(/Downloading tiny\.en… · 50%/)).toBeTruthy();
	const progress = screen.getByRole('progressbar', {
		name: 'Caption job progress',
	});
	expect(progress.getAttribute('aria-valuenow')).toBe('17');
	expect(progress.getAttribute('aria-valuetext')).toContain(
		'Downloading tiny.en… · 50%',
	);
});

test('opens a completed caption output as an asset without showing its caption count', () => {
	const pushState = spyOn(window.history, 'pushState').mockImplementation(
		() => undefined,
	);

	try {
		const {getCanvasContent} = renderWithCaptionJob({
			...baseJob,
			status: 'done',
			captionCount: 10,
		});

		expect(screen.getByText('Renders')).toBeTruthy();
		expect(screen.queryByText(/10 captions/)).toBeNull();
		expect(screen.getByText('dialogue-captions.json')).toBeTruthy();
		fireEvent.click(screen.getByText('dialogue-captions.json'));
		expect(getCanvasContent()).toEqual({
			type: 'asset',
			asset: 'dialogue-captions.json',
		});
		expect(pushState).toHaveBeenCalledWith(
			{},
			'Studio',
			'/assets/dialogue-captions.json',
		);
	} finally {
		pushState.mockRestore();
	}
});

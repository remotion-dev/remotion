import {afterEach, expect, spyOn, test} from 'bun:test';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import {type ContextType, useContext} from 'react';
import type {AddCaptionJobParams} from '../components/RenderQueue/caption-job-types';
import type {
	AddClientStillJobParams,
	CompositionRef,
} from '../components/RenderQueue/client-render-queue';
import {
	RenderQueueContext,
	RenderQueueContextProvider,
} from '../components/RenderQueue/context';
import type {AddVideoMattingJobParams} from '../components/RenderQueue/video-matting-job-types';

afterEach(cleanup);

const compositionRef: CompositionRef = {
	component: () => null,
	calculateMetadata: null,
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 30,
	defaultProps: {},
};

const makeCaptionParams = (displayName: string): AddCaptionJobParams => ({
	src: `/${displayName}`,
	displayName,
	audioStreamIndex: null,
	requestInit: null,
	outName: `${displayName}.json`,
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
});

const makeStillParams = (compositionId: string): AddClientStillJobParams => ({
	type: 'client-still',
	compositionId,
	outName: `${compositionId}.png`,
	imageFormat: 'png',
	frame: 0,
	inputProps: {},
	delayRenderTimeout: 30_000,
	mediaCacheSizeInBytes: null,
	logLevel: 'info',
	licenseKey: null,
	scale: 1,
	allowHtmlInCanvas: false,
});

const videoMattingParams: AddVideoMattingJobParams = {
	audio: 'base',
	baseOutName: 'video-base.webm',
	displayName: 'video.mp4',
	foregroundOutName: 'video-foreground.webm',
	model: 'ben2-base',
	src: '/video.mp4',
	videoBitrate: 'very-high',
};

const closeIsPrevented = () => {
	const event = new Event('beforeunload', {cancelable: true});
	window.dispatchEvent(event);
	return event.defaultPrevented;
};

test('prevents closing the tab while browser-local jobs are incomplete', async () => {
	let currentContext: ContextType<typeof RenderQueueContext> | null = null;
	const ReadContext = () => {
		currentContext = useContext(RenderQueueContext);
		return null;
	};

	render(
		<RenderQueueContextProvider>
			<ReadContext />
		</RenderQueueContextProvider>,
	);

	const getContext = () => {
		if (currentContext === null) {
			throw new Error('Render queue context is not mounted');
		}

		return currentContext;
	};

	expect(closeIsPrevented()).toBe(false);
	let captionId = '';
	act(() => {
		captionId = getContext().addCaptionJob(makeCaptionParams('audio.mp3'));
	});
	await waitFor(() => expect(closeIsPrevented()).toBe(true));
	act(() => getContext().markCaptionJobDone(captionId, 1));
	await waitFor(() => expect(closeIsPrevented()).toBe(false));

	let videoMattingId = '';
	act(() => {
		videoMattingId = getContext().addVideoMattingJob(videoMattingParams);
	});
	await waitFor(() => expect(closeIsPrevented()).toBe(true));
	act(() => getContext().markVideoMattingJobDone(videoMattingId));
	await waitFor(() => expect(closeIsPrevented()).toBe(false));

	let renderId = '';
	act(() => {
		renderId = getContext().addClientStillJob(
			makeStillParams('composition'),
			compositionRef,
		);
	});
	await waitFor(() => expect(closeIsPrevented()).toBe(true));
	act(() => getContext().markClientJobSaving(renderId));
	expect(closeIsPrevented()).toBe(true);
	act(() =>
		getContext().markClientJobDone(renderId, {
			height: 100,
			sizeInBytes: 1,
			width: 100,
		}),
	);
	await waitFor(() => expect(closeIsPrevented()).toBe(false));
});

test('processes client renders and captions in one local FIFO', async () => {
	const dateNow = spyOn(Date, 'now').mockReturnValue(1_000);
	let currentContext: ContextType<typeof RenderQueueContext> | null = null;
	const processedJobs: string[] = [];
	const ReadContext = () => {
		currentContext = useContext(RenderQueueContext);
		return null;
	};

	try {
		render(
			<RenderQueueContextProvider>
				<ReadContext />
			</RenderQueueContextProvider>,
		);

		const getContext = () => {
			if (currentContext === null) {
				throw new Error('Render queue context is not mounted');
			}

			return currentContext;
		};

		let firstCaptionId = '';
		let renderId = '';
		let secondCaptionId = '';
		act(() => {
			getContext().setProcessCaptionJobCallback((job) => {
				processedJobs.push(job.id);
				return Promise.resolve();
			});
			getContext().setProcessJobCallback((job) => {
				processedJobs.push(job.id);
				return Promise.resolve();
			});
			firstCaptionId = getContext().addCaptionJob(
				makeCaptionParams('first.mp3'),
			);
			renderId = getContext().addClientStillJob(
				makeStillParams('composition'),
				compositionRef,
			);
			secondCaptionId = getContext().addCaptionJob(
				makeCaptionParams('second.mp3'),
			);
		});

		await waitFor(() => expect(processedJobs).toEqual([firstCaptionId]));
		expect(
			getContext().clientJobs.find((job) => job.id === renderId)?.status,
		).toBe('idle');
		expect(
			getContext().captionJobs.find((job) => job.id === secondCaptionId)
				?.status,
		).toBe('idle');

		act(() => getContext().markCaptionJobDone(firstCaptionId, 1));
		await waitFor(() =>
			expect(processedJobs).toEqual([firstCaptionId, renderId]),
		);
		expect(
			getContext().captionJobs.find((job) => job.id === secondCaptionId)
				?.status,
		).toBe('idle');

		act(() => getContext().markClientJobSaving(renderId));
		expect(processedJobs).toEqual([firstCaptionId, renderId]);
		expect(
			getContext().captionJobs.find((job) => job.id === secondCaptionId)
				?.status,
		).toBe('idle');

		act(() =>
			getContext().markClientJobDone(renderId, {
				width: 100,
				height: 100,
				sizeInBytes: 1,
			}),
		);
		await waitFor(() =>
			expect(processedJobs).toEqual([
				firstCaptionId,
				renderId,
				secondCaptionId,
			]),
		);

		act(() => getContext().markCaptionJobDone(secondCaptionId, 1));
	} finally {
		dateNow.mockRestore();
	}
});

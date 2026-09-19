import {afterEach, expect, mock, test} from 'bun:test';
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import React, {useContext} from 'react';
import {ModalsProvider} from '../components/ModalsProvider';
import type {CaptionJob} from '../components/RenderQueue/caption-job-types';
import {CaptionQueueItem} from '../components/RenderQueue/CaptionQueueItem';
import {RenderQueueContext} from '../components/RenderQueue/context';
import {QueueJobErrorModal} from '../components/RenderQueue/QueueJobErrorModal';
import type {VideoMattingJob} from '../components/RenderQueue/video-matting-job-types';
import {VideoMattingQueueItem} from '../components/RenderQueue/VideoMattingQueueItem';
import {SelectedModalContext} from '../state/modals';

const originalClipboard = Object.getOwnPropertyDescriptor(
	navigator,
	'clipboard',
);

afterEach(() => {
	cleanup();
	if (originalClipboard) {
		Object.defineProperty(navigator, 'clipboard', originalClipboard);
	} else {
		Reflect.deleteProperty(navigator, 'clipboard');
	}
});

const captionJob: CaptionJob = {
	id: 'caption-job',
	type: 'caption',
	startedAt: 0,
	src: '/audio.mp3',
	displayName: 'audio.mp3',
	audioStreamIndex: null,
	requestInit: null,
	outName: 'captions.json',
	target: null,
	model: 'tiny.en',
	language: null,
	task: 'transcribe',
	chunkLengthInSeconds: 30,
	strideLengthInSeconds: 5,
	forceFullSequences: false,
	doSample: false,
	temperature: 1,
	topK: 50,
	repetitionPenalty: 1,
	noRepeatNgramSize: 0,
	status: 'failed',
	error: {
		message: 'Transcription pipeline failed',
		stack: 'Transcription pipeline failed\n    at transcribe.ts:42:1',
	},
};

const mattingJob: VideoMattingJob = {
	id: 'matting-job',
	type: 'video-matting',
	startedAt: 0,
	src: '/video.mp4',
	displayName: 'video.mp4',
	baseOutName: 'video-base.webm',
	foregroundOutName: 'video-foreground.webm',
	model: 'ben2-base',
	audio: 'base',
	videoBitrate: 'medium',
	target: null,
	status: 'failed',
	error: {
		message: 'Failed to create the LayerNorm shader',
		stack: 'OrtRun aborted\n    at matting.ts:17:1',
	},
};

const QueueJobErrorModalRenderer: React.FC = () => {
	const modal = useContext(SelectedModalContext);
	if (modal?.type !== 'queue-job-error') {
		return null;
	}

	return <QueueJobErrorModal title={modal.title} error={modal.error} />;
};

test('opens and copies transcription and video matting errors', async () => {
	const writeText = mock(() => Promise.resolve());
	Object.defineProperty(navigator, 'clipboard', {
		configurable: true,
		value: {writeText},
	});

	render(
		<ModalsProvider>
			<RenderQueueContext.Provider
				value={
					{
						jobs: [],
						captionJobs: [captionJob],
						videoMattingJobs: [mattingJob],
						removeCaptionJob: () => undefined,
						removeVideoMattingJob: () => undefined,
					} as never
				}
			>
				<CaptionQueueItem job={captionJob} selected={false} />
				<VideoMattingQueueItem job={mattingJob} selected={false} />
				<QueueJobErrorModalRenderer />
			</RenderQueueContext.Provider>
		</ModalsProvider>,
	);

	fireEvent.click(screen.getByRole('button', {name: captionJob.error.message}));
	const transcriptionDialog = screen.getByRole('dialog', {
		name: 'Transcription failed',
	});
	expect(transcriptionDialog.textContent).toContain(captionJob.error.stack!);
	fireEvent.click(
		within(transcriptionDialog).getByRole('button', {name: 'Copy stack'}),
	);
	await waitFor(() => {
		expect(writeText).toHaveBeenCalledWith(captionJob.error.stack!);
	});
	fireEvent.click(
		within(transcriptionDialog).getByRole('button', {name: 'Close'}),
	);

	fireEvent.click(screen.getByRole('button', {name: mattingJob.error.message}));
	const mattingDialog = screen.getByRole('dialog', {
		name: 'Video matting failed',
	});
	expect(mattingDialog.textContent).toContain(
		`${mattingJob.error.message}\n${mattingJob.error.stack}`,
	);
	fireEvent.click(
		within(mattingDialog).getByRole('button', {name: 'Copy stack'}),
	);
	await waitFor(() => {
		expect(writeText).toHaveBeenCalledWith(
			`${mattingJob.error.message}\n${mattingJob.error.stack}`,
		);
	});
});

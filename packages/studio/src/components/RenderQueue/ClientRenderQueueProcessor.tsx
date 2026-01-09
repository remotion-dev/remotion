import type {
	ClientRenderJob,
	ClientStillRenderJob,
	ClientVideoRenderJob,
} from '@remotion/studio-shared';
import type {
	WebRendererAudioCodec,
	WebRendererContainer,
	WebRendererQuality,
	WebRendererVideoCodec,
} from '@remotion/web-renderer';
import {renderMediaOnWeb, renderStillOnWeb} from '@remotion/web-renderer';
import {useCallback, useEffect} from 'react';
import {
	getAbortController,
	getCompositionForJob,
	markClientJobDone,
	markClientJobFailed,
	setProcessJobCallback,
	updateClientJobProgress,
} from './client-render-queue';

const downloadBlob = (blob: Blob, filename: string): void => {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	const cleanFilename = filename.includes('/')
		? filename.substring(filename.lastIndexOf('/') + 1)
		: filename;
	a.download = cleanFilename;
	a.click();
	URL.revokeObjectURL(url);
};

const processStillJob = async (
	job: ClientStillRenderJob,
	signal: AbortSignal,
): Promise<void> => {
	const compositionRef = getCompositionForJob(job.id);
	if (!compositionRef) {
		throw new Error(`Composition not found for job ${job.id}`);
	}

	const {blob} = await renderStillOnWeb({
		composition: {
			component: compositionRef.component,
			width: compositionRef.width,
			height: compositionRef.height,
			fps: compositionRef.fps,
			durationInFrames: compositionRef.durationInFrames,
			defaultProps: compositionRef.defaultProps,
			calculateMetadata: compositionRef.calculateMetadata ?? undefined,
			id: job.compositionId,
		},
		frame: job.frame,
		imageFormat: job.imageFormat,
		inputProps: job.inputProps,
		delayRenderTimeoutInMilliseconds: job.delayRenderTimeout,
		mediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
		logLevel: job.logLevel,
		licenseKey: job.licenseKey ?? undefined,
		signal,
	});

	downloadBlob(blob, job.outName);
};

const processVideoJob = async (
	job: ClientVideoRenderJob,
	signal: AbortSignal,
): Promise<void> => {
	const compositionRef = getCompositionForJob(job.id);
	if (!compositionRef) {
		throw new Error(`Composition not found for job ${job.id}`);
	}

	const totalFrames = job.endFrame - job.startFrame + 1;

	const {getBlob} = await renderMediaOnWeb({
		composition: {
			component: compositionRef.component,
			width: compositionRef.width,
			height: compositionRef.height,
			fps: compositionRef.fps,
			durationInFrames: compositionRef.durationInFrames,
			defaultProps: compositionRef.defaultProps,
			calculateMetadata: compositionRef.calculateMetadata ?? undefined,
			id: job.compositionId,
		},
		inputProps: job.inputProps,
		delayRenderTimeoutInMilliseconds: job.delayRenderTimeout,
		mediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
		logLevel: job.logLevel,
		videoCodec: job.videoCodec as WebRendererVideoCodec,
		audioCodec: job.audioCodec as WebRendererAudioCodec,
		audioBitrate: job.audioBitrate as WebRendererQuality,
		container: job.container as WebRendererContainer,
		videoBitrate: job.videoBitrate as WebRendererQuality,
		hardwareAcceleration: job.hardwareAcceleration as
			| 'no-preference'
			| 'prefer-hardware'
			| 'prefer-software',
		keyframeIntervalInSeconds: job.keyframeIntervalInSeconds,
		frameRange: [job.startFrame, job.endFrame],
		transparent: job.transparent,
		muted: job.muted,
		signal,
		onProgress: (progress) => {
			updateClientJobProgress(job.id, {
				renderedFrames: progress.renderedFrames,
				encodedFrames: progress.encodedFrames,
				totalFrames,
			});
		},
		outputTarget: 'web-fs',
		licenseKey: job.licenseKey ?? undefined,
	});

	const blob = await getBlob();
	downloadBlob(blob, job.outName);
};

export const ClientRenderQueueProcessor: React.FC = () => {
	const processJob = useCallback(async (job: ClientRenderJob) => {
		const abortController = getAbortController(job.id);

		try {
			if (job.type === 'client-still') {
				await processStillJob(job, abortController.signal);
			} else if (job.type === 'client-video') {
				await processVideoJob(job, abortController.signal);
			}

			markClientJobDone(job.id);
		} catch (err) {
			if (abortController.signal.aborted) {
				markClientJobFailed(job.id, new Error('Render was cancelled'));
			} else {
				markClientJobFailed(job.id, err as Error);
			}
		}
	}, []);

	useEffect(() => {
		setProcessJobCallback(processJob);
		return () => setProcessJobCallback(null);
	}, [processJob]);

	return null;
};

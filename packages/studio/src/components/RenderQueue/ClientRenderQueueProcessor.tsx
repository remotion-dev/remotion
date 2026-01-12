import type {
	ClientRenderJob,
	ClientRenderJobProgress,
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
import {useCallback, useContext, useEffect} from 'react';
import {RenderQueueContext} from './context';

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

export const ClientRenderQueueProcessor: React.FC = () => {
	const {
		getAbortController,
		getCompositionForJob,
		updateClientJobProgress,
		markClientJobDone,
		markClientJobFailed,
		setProcessJobCallback,
	} = useContext(RenderQueueContext);

	const processStillJob = useCallback(
		async (job: ClientStillRenderJob, signal: AbortSignal): Promise<void> => {
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
		},
		[getCompositionForJob],
	);

	const processVideoJob = useCallback(
		async (
			job: ClientVideoRenderJob,
			signal: AbortSignal,
			onProgress: (jobId: string, progress: ClientRenderJobProgress) => void,
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
					onProgress(job.id, {
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
		},
		[getCompositionForJob],
	);

	const processJob = useCallback(
		async (job: ClientRenderJob) => {
			const abortController = getAbortController(job.id);

			try {
				if (job.type === 'client-still') {
					await processStillJob(job, abortController.signal);
				} else if (job.type === 'client-video') {
					await processVideoJob(
						job,
						abortController.signal,
						updateClientJobProgress,
					);
				}

				markClientJobDone(job.id);
			} catch (err) {
				if (abortController.signal.aborted) {
					markClientJobFailed(job.id, new Error('Render was cancelled'));
				} else {
					markClientJobFailed(job.id, err as Error);
				}
			}
		},
		[
			getAbortController,
			processStillJob,
			processVideoJob,
			updateClientJobProgress,
			markClientJobDone,
			markClientJobFailed,
		],
	);

	useEffect(() => {
		setProcessJobCallback(processJob);
		return () => setProcessJobCallback(null);
	}, [processJob, setProcessJobCallback]);

	return null;
};

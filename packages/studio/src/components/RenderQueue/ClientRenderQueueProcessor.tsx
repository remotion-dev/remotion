import type {
	ClientRenderJob,
	ClientRenderJobProgress,
	ClientRenderMetadata,
	ClientStillRenderJob,
	ClientVideoRenderJob,
	GetBlobCallback,
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

type RenderResult = {
	getBlob: GetBlobCallback;
	width: number;
	height: number;
};

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
		async (
			job: ClientStillRenderJob,
			signal: AbortSignal,
		): Promise<RenderResult> => {
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

			return {
				getBlob: () => Promise.resolve(blob),
				width: compositionRef.width,
				height: compositionRef.height,
			};
		},
		[getCompositionForJob],
	);

	const processVideoJob = useCallback(
		async (
			job: ClientVideoRenderJob,
			signal: AbortSignal,
			onProgress: (jobId: string, progress: ClientRenderJobProgress) => void,
		): Promise<RenderResult> => {
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

			return {
				getBlob,
				width: compositionRef.width,
				height: compositionRef.height,
			};
		},
		[getCompositionForJob],
	);

	const processJob = useCallback(
		async (job: ClientRenderJob) => {
			const abortController = getAbortController(job.id);

			try {
				let result: RenderResult;

				if (job.type === 'client-still') {
					result = await processStillJob(job, abortController.signal);
				} else if (job.type === 'client-video') {
					result = await processVideoJob(
						job,
						abortController.signal,
						updateClientJobProgress,
					);
				} else {
					throw new Error(`Unknown job type`);
				}

				const blob = await result.getBlob();
				downloadBlob(blob, job.outName);

				const metadata: ClientRenderMetadata = {
					width: result.width,
					height: result.height,
					sizeInBytes: blob.size,
				};
				markClientJobDone(job.id, result.getBlob, metadata);
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

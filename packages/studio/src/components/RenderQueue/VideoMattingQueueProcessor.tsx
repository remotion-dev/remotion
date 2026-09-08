import {
	canUseVideoMatting,
	disposeVideoMattingModel,
	isVideoMattingModelCached,
	loadVideoMattingModel,
	separateVideoLayers,
} from '@remotion/video-matting';
import {useCallback, useContext, useEffect} from 'react';
import {writeStaticFile} from '../../api/write-static-file';
import {RenderQueueContext} from './context';
import {loadModelForJob} from './load-model-for-job';
import type {VideoMattingJob} from './video-matting-job-types';

export const VideoMattingQueueProcessor: React.FC = () => {
	const {
		markVideoMattingJobDone,
		markVideoMattingJobFailed,
		setProcessVideoMattingJobCallback,
		updateVideoMattingJobProgress,
	} = useContext(RenderQueueContext);

	const processJob = useCallback(
		async (job: VideoMattingJob) => {
			let outputs: Awaited<ReturnType<typeof separateVideoLayers>> | null =
				null;
			let processingError: Error | null = null;
			try {
				updateVideoMattingJobProgress(job.id, {
					message: 'Checking WebGPU support...',
					value: 0,
				});
				const support = await canUseVideoMatting({model: job.model});
				if (!support.supported) {
					throw new Error(support.detailedReason);
				}

				await loadModelForJob({
					model: job.model,
					progressStart: 0,
					progressSpan: 0.2,
					isModelCached: (model) => isVideoMattingModelCached({model}),
					loadModel: (model, onProgress) =>
						loadVideoMattingModel({
							model,
							onProgress: (progress) => onProgress(progress.progress),
						}),
					updateProgress: (progress) =>
						updateVideoMattingJobProgress(job.id, progress),
				});

				outputs = await separateVideoLayers({
					src: job.src,
					model: job.model,
					audio: job.audio,
					videoBitrate: job.videoBitrate,
					onProgress: (progress) => {
						updateVideoMattingJobProgress(job.id, {
							message:
								progress.stage === 'finalizing'
									? 'Finalizing video layers...'
									: `Separating ${job.displayName}... ${Math.round(progress.progress * 100)}%`,
							value: 0.2 + (progress.progress ?? 1) * 0.65,
						});
					},
				});

				updateVideoMattingJobProgress(job.id, {
					message: 'Saving video layers...',
					value: 0.88,
				});
				const [base, foreground] = await Promise.all([
					outputs.base.getBlob(),
					outputs.foreground.getBlob(),
				]);
				await Promise.all([
					base
						.arrayBuffer()
						.then((contents) =>
							writeStaticFile({contents, filePath: job.baseOutName}),
						),
					foreground
						.arrayBuffer()
						.then((contents) =>
							writeStaticFile({contents, filePath: job.foregroundOutName}),
						),
				]);
			} catch (error) {
				processingError =
					error instanceof Error ? error : new Error(String(error));
			}

			try {
				await Promise.all([
					outputs?.base.dispose(),
					outputs?.foreground.dispose(),
				]);
				await disposeVideoMattingModel({model: job.model});
			} catch {
				// Cleanup errors must not hide successfully written outputs.
			}

			if (processingError) {
				markVideoMattingJobFailed(job.id, processingError);
			} else {
				markVideoMattingJobDone(job.id);
			}
		},
		[
			markVideoMattingJobDone,
			markVideoMattingJobFailed,
			updateVideoMattingJobProgress,
		],
	);

	useEffect(() => {
		setProcessVideoMattingJobCallback(processJob);
		return () => setProcessVideoMattingJobCallback(null);
	}, [processJob, setProcessVideoMattingJobCallback]);

	return null;
};

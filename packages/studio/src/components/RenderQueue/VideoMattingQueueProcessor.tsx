import {
	canUseVideoMatting,
	disposeVideoMattingModel,
	downloadVideoMattingModel,
	isVideoMattingModelCached,
	loadVideoMattingModel,
	removeVideoBackground,
	type RemoveVideoBackgroundResult,
	type SeparateVideoLayersProgress,
} from '@remotion/video-matting';
import {useCallback, useContext, useEffect} from 'react';
import {writeStaticFile} from '../../api/write-static-file';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {callApi} from '../call-api';
import {RenderQueueContext} from './context';
import {loadModelForJob} from './load-model-for-job';
import type {VideoMattingJob} from './video-matting-job-types';

export const VideoMattingQueueProcessor: React.FC = () => {
	const {
		markVideoMattingJobDone,
		markVideoMattingJobFailed,
		markVideoMattingJobCancelled,
		markVideoMattingJobSaving,
		getAbortController,
		setProcessVideoMattingJobCallback,
		updateVideoMattingJobProgress,
	} = useContext(RenderQueueContext);

	const processJob = useCallback(
		async (job: VideoMattingJob) => {
			const {signal} = getAbortController(job.id);
			let output: RemoveVideoBackgroundResult | null = null;
			let processingError: Error | null = null;
			try {
				signal.throwIfAborted();
				updateVideoMattingJobProgress(job.id, {
					detail: null,
					message: 'Checking WebGPU support...',
					value: 0,
				});
				const support = await canUseVideoMatting({model: job.model});
				signal.throwIfAborted();
				if (!support.supported) {
					throw new Error(support.detailedReason);
				}

				await loadModelForJob({
					signal,
					model: job.model,
					progressStart: 0,
					progressSpan: 0.2,
					isModelCached: (model) => isVideoMattingModelCached({model}),
					loadModel: async (model, onProgress) => {
						await downloadVideoMattingModel({
							signal,
							model,
							onProgress: (progress) => onProgress(progress.progress),
						});
						await loadVideoMattingModel({model, signal});
					},
					updateProgress: (progress) =>
						updateVideoMattingJobProgress(job.id, {
							...progress,
							detail: null,
						}),
				});

				const mattingOptions = {
					signal,
					src: job.src,
					model: job.model,
					videoBitrate: job.videoBitrate,
					onProgress: (progress: SeparateVideoLayersProgress) => {
						updateVideoMattingJobProgress(job.id, {
							detail:
								progress.stage === 'finalizing'
									? `Processed ${progress.processedFrames} ${progress.processedFrames === 1 ? 'frame' : 'frames'}`
									: `Processed ${progress.processedFrames} ${progress.processedFrames === 1 ? 'frame' : 'frames'} · ${Math.round(progress.progress * 100)}%`,
							message:
								progress.stage === 'finalizing'
									? 'Finalizing video...'
									: 'Removing background...',
							value: 0.2 + (progress.progress ?? 1) * 0.65,
						});
					},
				};
				output = await removeVideoBackground({
					...mattingOptions,
					audio: job.audio,
				});
				if (output === null) {
					throw new Error('Video matting produced no output.');
				}

				signal.throwIfAborted();
				updateVideoMattingJobProgress(job.id, {
					detail: null,
					message: 'Saving video...',
					value: 0.88,
				});
				const video = await output.video.getBlob();
				signal.throwIfAborted();
				markVideoMattingJobSaving(job.id);
				await video
					.arrayBuffer()
					.then((contents) =>
						writeStaticFile({contents, filePath: job.outName}),
					);

				if (job.target !== null) {
					updateVideoMattingJobProgress(job.id, {
						detail: null,
						message: 'Replacing video source...',
						value: 0.97,
					});
					const browserStudioOperations = getBrowserStudioOperations();
					const request = {
						fileName: job.target.fileName,
						nodePath: job.target.nodePath.nodePath,
						src: job.outName,
					};
					const replaceSource = browserStudioOperations?.replaceVideoSource;
					if (browserStudioOperations && !replaceSource) {
						throw new Error('Browser Studio cannot replace the video source.');
					}

					const response = replaceSource
						? await replaceSource(request)
						: await callApi('/api/replace-video-source', request);
					if (!response.success) {
						throw new Error(response.reason);
					}
				}
			} catch (error) {
				processingError =
					error instanceof Error ? error : new Error(String(error));
			}

			if (output) {
				await Promise.allSettled([output.video.dispose()]);
			}

			try {
				await disposeVideoMattingModel({model: job.model});
			} catch {
				// Cleanup errors must not hide successfully written outputs.
			}

			if (signal.aborted) {
				markVideoMattingJobCancelled(job.id);
			} else if (processingError) {
				markVideoMattingJobFailed(job.id, processingError);
			} else {
				markVideoMattingJobDone(job.id);
			}
		},
		[
			getAbortController,
			markVideoMattingJobCancelled,
			markVideoMattingJobSaving,
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

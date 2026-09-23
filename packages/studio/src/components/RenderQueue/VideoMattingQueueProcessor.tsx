import {
	canUseVideoMatting,
	disposeVideoMattingModel,
	downloadVideoMattingModel,
	isVideoMattingModelCached,
	loadVideoMattingModel,
	removeVideoBackground,
	separateVideoLayers,
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
			let outputs:
				| Awaited<ReturnType<typeof separateVideoLayers>>
				| RemoveVideoBackgroundResult
				| null = null;
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
									: 'outName' in job
										? 'Removing background...'
										: 'Separating foreground...',
							value: 0.2 + (progress.progress ?? 1) * 0.65,
						});
					},
				};
				outputs =
					'outName' in job
						? await removeVideoBackground({...mattingOptions, audio: job.audio})
						: await separateVideoLayers({...mattingOptions, audio: job.audio});
				if (outputs === null) {
					throw new Error('Video matting produced no output.');
				}

				signal.throwIfAborted();
				updateVideoMattingJobProgress(job.id, {
					detail: null,
					message: 'Saving video...',
					value: 0.88,
				});
				const foreground = await (
					'video' in outputs ? outputs.video : outputs.foreground
				).getBlob();
				const base = 'base' in outputs ? await outputs.base.getBlob() : null;
				signal.throwIfAborted();
				markVideoMattingJobSaving(job.id);
				if ('outName' in job) {
					await foreground
						.arrayBuffer()
						.then((contents) =>
							writeStaticFile({contents, filePath: job.outName}),
						);
				} else {
					await Promise.all([
						base!
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
				}

				if (job.target !== null) {
					updateVideoMattingJobProgress(job.id, {
						detail: null,
						message: 'Replacing video source...',
						value: 0.97,
					});
					const browserStudioOperations = getBrowserStudioOperations();
					if ('outName' in job) {
						const request = {
							fileName: job.target.fileName,
							nodePath: job.target.nodePath.nodePath,
							src: job.outName,
						};
						const replaceSource = browserStudioOperations?.replaceVideoSource;
						if (browserStudioOperations && !replaceSource) {
							throw new Error(
								'Browser Studio cannot replace the video source.',
							);
						}

						const response = replaceSource
							? await replaceSource(request)
							: await callApi('/api/replace-video-source', request);
						if (!response.success) {
							throw new Error(response.reason);
						}
					} else {
						const request = {
							fileName: job.target.fileName,
							nodePath: job.target.nodePath.nodePath,
							baseSrc: job.baseOutName,
							foregroundSrc: job.foregroundOutName,
						};
						const response = browserStudioOperations
							? await browserStudioOperations.insertVideoLayers(request)
							: await callApi('/api/insert-video-layers', request);
						if (!response.success) {
							throw new Error(response.reason);
						}
					}
				}
			} catch (error) {
				processingError =
					error instanceof Error ? error : new Error(String(error));
			}

			if (outputs) {
				await Promise.allSettled([
					'base' in outputs ? outputs.base.dispose() : null,
					'video' in outputs
						? outputs.video.dispose()
						: outputs.foreground.dispose(),
				]);
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

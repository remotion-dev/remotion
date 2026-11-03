import type {CompletedClientRender} from '@remotion/studio-shared';
import {
	getConflictingOutputPaths,
	getPortableDownloadFilename,
	validateStudioArtifactFilename,
} from '@remotion/studio-shared';
import type {
	WebRendererAudioCodec,
	WebRendererOnArtifact,
	WebRendererContainer,
	WebRendererQuality,
} from '@remotion/web-renderer';
import {renderMediaOnWeb, renderStillOnWeb} from '@remotion/web-renderer';
import {downloadZip} from 'client-zip';
import {useCallback, useContext, useEffect} from 'react';
import {
	registerClientRender,
	saveOutputFile,
} from '../../api/save-render-output';
import {downloadBlob, getDownloadFilename} from '../../helpers/download-blob';
import {getRenderJobOutputPath} from '../../helpers/output-path';
import {getPreviewServerConnectionState} from '../../helpers/preview-server-events';
import type {
	ClientRenderJob,
	ClientRenderJobProgress,
	ClientStillRenderJob,
	ClientVideoRenderJob,
	GetBlobCallback,
} from './client-side-render-types';
import {RenderQueueContext} from './context';

type RenderResult = {
	getBlob: GetBlobCallback;
	width: number;
	height: number;
};

export const ClientRenderQueueProcessor: React.FC = () => {
	const {
		getAbortController,
		getCompositionForJob,
		updateClientJobProgress,
		markClientJobSaving,
		markClientJobDone,
		markClientJobFailed,
		markClientJobCancelled,
		setProcessJobCallback,
	} = useContext(RenderQueueContext);

	const processStillJob = useCallback(
		async (
			job: ClientStillRenderJob,
			signal: AbortSignal,
			onArtifact: WebRendererOnArtifact,
		): Promise<RenderResult> => {
			const compositionRef = getCompositionForJob(job.id);
			if (!compositionRef) {
				throw new Error(`Composition not found for job ${job.id}`);
			}

			const blob = await (
				await renderStillOnWeb({
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
					inputProps: job.inputProps,
					delayRenderTimeoutInMilliseconds: job.delayRenderTimeout,
					mediaCacheSizeInBytes: job.mediaCacheSizeInBytes,
					preferredEffectBackend: job.preferredEffectBackend,
					logLevel: job.logLevel,
					licenseKey: job.licenseKey ?? undefined,
					scale: job.scale,
					signal,
					onArtifact,
					allowHtmlInCanvas: job.allowHtmlInCanvas,
				})
			).blob({format: job.imageFormat});

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
			onArtifact: WebRendererOnArtifact,
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
				preferredEffectBackend: job.preferredEffectBackend,
				logLevel: job.logLevel,
				videoCodec: job.videoCodec ?? undefined,
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
				scale: job.scale,
				signal,
				onArtifact,
				onProgress: (progress) => {
					onProgress(job.id, {
						encodedFrames: progress.encodedFrames,
						totalFrames,
						doneIn: progress.doneIn,
						renderEstimatedTime: progress.renderEstimatedTime,
						progress: progress.progress,
					});
				},
				outputTarget: null,
				licenseKey: job.licenseKey ?? undefined,
				pageResponsiveness: job.pageResponsiveness,
				allowHtmlInCanvas: job.allowHtmlInCanvas,
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
			if (job.status !== 'idle') {
				return;
			}

			const abortController = getAbortController(job.id);

			try {
				const artifacts: {filename: string; blob: Blob}[] = [];
				const onArtifact: WebRendererOnArtifact = ({filename, content}) => {
					validateStudioArtifactFilename(filename);
					artifacts.push({
						filename,
						blob: new Blob([
							typeof content === 'string' ? content : new Uint8Array(content),
						]),
					});
				};

				let result: RenderResult;

				if (job.type === 'client-still') {
					result = await processStillJob(
						job,
						abortController.signal,
						onArtifact,
					);
				} else if (job.type === 'client-video') {
					result = await processVideoJob(
						job,
						abortController.signal,
						onArtifact,
						updateClientJobProgress,
					);
				} else {
					throw new Error(`Unknown job type`);
				}

				const conflict = getConflictingOutputPaths(
					artifacts.map(({filename}) => filename),
				);
				if (conflict) {
					throw new Error(
						`The artifact paths "${conflict[0]}" and "${conflict[1]}" must identify separate files.`,
					);
				}

				const blob = await result.getBlob();
				const metadata: CompletedClientRender['metadata'] = {
					width: result.width,
					height: result.height,
					sizeInBytes: blob.size,
				};

				markClientJobSaving(job.id);

				if (
					!job.downloadOutput &&
					getPreviewServerConnectionState().type === 'connected'
				) {
					try {
						const outputPath = getRenderJobOutputPath(job);
						if (artifacts.length > 0) {
							const normalizedOutputPath = outputPath
								.split(/[/\\]+/)
								.filter(Boolean)
								.join('/');
							const collision = getConflictingOutputPaths([
								normalizedOutputPath,
								...artifacts.map(
									({filename}) => `out/${job.compositionId}/${filename}`,
								),
							]);
							if (collision) {
								throw new Error(
									`An artifact conflicts with the main output "${job.outName}".`,
								);
							}
						}

						for (const artifact of artifacts) {
							await saveOutputFile({
								blob: artifact.blob,
								filePath: artifact.filename,
								artifact: {
									compositionId: job.compositionId,
									outputName: outputPath,
								},
							});
						}

						await saveOutputFile({blob, filePath: outputPath, artifact: null});
						await registerClientRender({
							id: job.id,
							type: job.type,
							compositionId: job.compositionId,
							outName: outputPath,
							startedAt: job.startedAt,
							deletedOutputLocation: false,
							metadata,
						});
						markClientJobDone(job.id, metadata, null);
						return;
					} catch (err) {
						// eslint-disable-next-line no-console
						console.error(
							'Failed to save render output, falling back to browser download.',
							err,
						);
					}
				}

				let downloadFile = blob;
				let downloadName = job.outName;
				if (artifacts.length > 0) {
					const name = getPortableDownloadFilename(
						getDownloadFilename(job.outName),
					);
					downloadFile = await downloadZip([
						{name, input: blob},
						...artifacts.map((artifact) => ({
							name: 'artifacts/' + artifact.filename,
							input: artifact.blob,
						})),
					]).blob();
					downloadName = name.replace(/\.[^.]+$/, '') + '.zip';
				}

				const download = () => downloadBlob(downloadFile, downloadName);
				download();
				markClientJobDone(job.id, metadata, {
					getBlob: () => Promise.resolve(blob),
					download,
				});
			} catch (err) {
				if (abortController.signal.aborted) {
					markClientJobCancelled(job.id);
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
			markClientJobSaving,
			markClientJobDone,
			markClientJobFailed,
			markClientJobCancelled,
		],
	);

	useEffect(() => {
		setProcessJobCallback(processJob);
		return () => setProcessJobCallback(null);
	}, [processJob, setProcessJobCallback]);

	return null;
};

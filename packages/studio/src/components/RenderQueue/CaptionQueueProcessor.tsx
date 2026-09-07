import {formatBytes} from '@remotion/studio-shared';
import {
	canUseWhisperWebGpu,
	clearStaleModels,
	disposeWhisperModel,
	isWhisperModelCached,
	loadWhisperModel,
	toCaptions,
	transcribe,
} from '@remotion/whisper-webgpu';
import {useCallback, useContext, useEffect} from 'react';
import {writeStaticFile} from '../../api/write-static-file';
import {resampleMediaTo16Khz} from '../Transcription/resample-media-to-16-khz';
import type {CaptionJob} from './caption-job-types';
import {RenderQueueContext} from './context';

export const CaptionQueueProcessor: React.FC = () => {
	const {
		updateCaptionJobProgress,
		markCaptionJobDone,
		markCaptionJobFailed,
		setProcessCaptionJobCallback,
	} = useContext(RenderQueueContext);

	const processJob = useCallback(
		async (job: CaptionJob) => {
			let captionCount: number | null = null;
			let processingError: Error | null = null;
			try {
				updateCaptionJobProgress(job.id, {
					message: 'Checking WebGPU support...',
					value: 0,
				});
				const support = await canUseWhisperWebGpu();
				if (!support.supported) {
					throw new Error(support.detailedReason);
				}

				updateCaptionJobProgress(job.id, {
					message: `Checking ${job.model}...`,
					value: 0.02,
				});
				await clearStaleModels();
				const modelIsCached = await isWhisperModelCached({model: job.model});
				await loadWhisperModel({
					model: job.model,
					onProgress: (progress) => {
						const percentage =
							progress.progress === null
								? null
								: `${Math.round(progress.progress * 100)}%`;
						const bytes =
							progress.loadedBytes === null || progress.totalBytes === null
								? null
								: `${formatBytes(progress.loadedBytes)} / ${formatBytes(progress.totalBytes)}`;
						updateCaptionJobProgress(job.id, {
							message: [
								`${modelIsCached ? 'Loading' : 'Downloading'} ${job.model}…`,
								percentage,
								bytes,
							]
								.filter(Boolean)
								.join(' · '),
							value: 0.03 + (progress.progress ?? 0) * 0.27,
						});
					},
				});

				updateCaptionJobProgress(job.id, {
					message: `Preparing ${job.displayName}...`,
					value: 0.3,
				});
				const channelWaveform = await resampleMediaTo16Khz({
					src: job.src,
					audioStreamIndex: job.audioStreamIndex,
					requestInit: job.requestInit,
					onProgress: (progress) => {
						updateCaptionJobProgress(job.id, {
							message: `Preparing ${job.displayName}...`,
							value: 0.3 + progress * 0.2,
						});
					},
				});

				updateCaptionJobProgress(job.id, {
					message: `Transcribing ${job.displayName}...`,
					value: 0.5,
				});
				const transcription = await transcribe({
					channelWaveform,
					model: job.model,
					task: job.task,
					chunkLengthInSeconds: job.chunkLengthInSeconds,
					strideLengthInSeconds: job.strideLengthInSeconds,
					forceFullSequences: job.forceFullSequences,
					doSample: job.doSample,
					temperature: job.temperature,
					topK: job.topK,
					repetitionPenalty: job.repetitionPenalty,
					noRepeatNgramSize: job.noRepeatNgramSize,
					...(job.language === null ? {} : {language: job.language}),
				});
				const {captions} = toCaptions({
					whisperWebGpuOutput: transcription,
				});

				updateCaptionJobProgress(job.id, {
					message: `Saving ${job.outName}...`,
					value: 0.95,
				});
				await writeStaticFile({
					contents: JSON.stringify(captions, null, 2),
					filePath: job.outName,
				});
				captionCount = captions.length;
			} catch (error) {
				processingError =
					error instanceof Error ? error : new Error(String(error));
			}

			try {
				await disposeWhisperModel({model: job.model});
			} catch {
				// The pipeline is removed from the in-memory registry before disposal.
				// A cleanup failure should not hide a successfully written caption file.
			}

			if (processingError) {
				markCaptionJobFailed(job.id, processingError);
			} else {
				markCaptionJobDone(job.id, captionCount ?? 0);
			}
		},
		[markCaptionJobDone, markCaptionJobFailed, updateCaptionJobProgress],
	);

	useEffect(() => {
		setProcessCaptionJobCallback(processJob);
		return () => setProcessCaptionJobCallback(null);
	}, [processJob, setProcessCaptionJobCallback]);

	return null;
};

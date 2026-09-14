import type {InputAudioTrack} from 'mediabunny';
import {ALL_FORMATS, AudioSampleSink, Input, UrlSource} from 'mediabunny';
import {TARGET_SAMPLE_RATE} from './constants';
import {getWaveformCacheKey} from './get-waveform-cache-key';
import {getAudioSampleStartFrameAtTimelineZero} from './trim-audio-sample-before-zero';
import {
	createWaveformPeakProcessor,
	emitWaveformProgress,
} from './waveform-peak-processor';
const DEFAULT_PROGRESS_INTERVAL_IN_MS = 50;

export type WaveformResult = {
	readonly peaks: Float32Array;
	readonly averageVolume: number | null;
};

const peaksCache = new Map<string, WaveformResult>();

export {TARGET_SAMPLE_RATE};

type Progress = {
	readonly averageVolume: number | null;
	readonly peaks: Float32Array;
	readonly completedPeaks: number;
	readonly totalPeaks: number;
	readonly final: boolean;
};

type LoadWaveformPeaksOptions = {
	readonly onProgress?: (progress: Progress) => void;
	readonly progressIntervalInMs?: number;
	readonly waveformSampleRate?: number;
};

export async function loadWaveformPeaks(
	src: string | InputAudioTrack,
	signal: AbortSignal,
	options?: LoadWaveformPeaksOptions,
): Promise<WaveformResult> {
	const waveformSampleRate = options?.waveformSampleRate ?? TARGET_SAMPLE_RATE;
	if (!Number.isFinite(waveformSampleRate) || waveformSampleRate <= 0) {
		throw new Error('The waveform sample rate must be a positive number.');
	}

	const cacheKey = getWaveformCacheKey(src, waveformSampleRate);
	const cached = peaksCache.get(cacheKey);
	if (cached) {
		emitWaveformProgress({
			peaks: cached.peaks,
			averageVolume: cached.averageVolume,
			completedPeaks: cached.peaks.length,
			totalPeaks: cached.peaks.length,
			final: true,
			onProgress: options?.onProgress,
		});
		return cached;
	}

	const input =
		typeof src === 'string'
			? new Input({formats: ALL_FORMATS, source: new UrlSource(src)})
			: null;

	try {
		const audioTrack =
			typeof src === 'string' ? await input!.getPrimaryAudioTrack() : src;
		if (!audioTrack) {
			return {peaks: new Float32Array(0), averageVolume: null};
		}

		if (await audioTrack.isLive()) {
			throw new Error(
				'Live streams are not currently supported by Remotion. Sorry! Source: ' +
					(typeof src === 'string' ? src : `audio track ${src.id}`),
			);
		}

		if (await audioTrack.isRelativeToUnixEpoch()) {
			throw new Error(
				'Streams with UNIX timestamps are not currently supported by Remotion. Sorry! Source: ' +
					(typeof src === 'string' ? src : `audio track ${src.id}`),
			);
		}

		const audioSampleRate = await audioTrack.getSampleRate();
		const durationInSeconds =
			(await audioTrack.getDurationFromMetadata({skipLiveWait: true})) ??
			(await audioTrack.computeDuration({skipLiveWait: true}));
		const totalPeaks = Math.ceil(durationInSeconds * waveformSampleRate);
		const samplesPerPeak = Math.max(
			1,
			Math.floor(audioSampleRate / waveformSampleRate),
		);

		const sink = new AudioSampleSink(audioTrack);
		const processor = createWaveformPeakProcessor({
			totalPeaks,
			samplesPerPeak,
			onProgress: options?.onProgress,
			progressIntervalInMs:
				options?.progressIntervalInMs ??
				DEFAULT_PROGRESS_INTERVAL_IN_MS *
					Math.max(1, waveformSampleRate / TARGET_SAMPLE_RATE),
			now: () => Date.now(),
		});

		for await (const sample of sink.samples()) {
			if (signal.aborted) {
				sample.close();
				return {peaks: new Float32Array(0), averageVolume: null};
			}

			const startFrame = getAudioSampleStartFrameAtTimelineZero(sample);
			if (startFrame === null) {
				sample.close();
				continue;
			}

			const frameCount = sample.numberOfFrames - startFrame;
			if (frameCount <= 0) {
				sample.close();
				continue;
			}

			const bytesNeeded = sample.allocationSize({
				format: 'f32',
				planeIndex: 0,
				frameOffset: startFrame,
				frameCount,
			});
			const floats = new Float32Array(bytesNeeded / 4);
			sample.copyTo(floats, {
				format: 'f32',
				planeIndex: 0,
				frameOffset: startFrame,
				frameCount,
			});
			const channels = Math.max(1, sample.numberOfChannels);
			const {sampleRate} = sample;
			sample.close();

			processor.processSampleChunk(floats, channels, sampleRate);
		}

		processor.finalize();
		const result = {
			peaks: processor.peaks,
			averageVolume: processor.averageVolume,
		};
		peaksCache.set(cacheKey, result);
		return result;
	} finally {
		input?.dispose();
	}
}

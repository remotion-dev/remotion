import {ALL_FORMATS, AudioSampleSink, Input, UrlSource} from 'mediabunny';
import {TARGET_SAMPLE_RATE} from './constants';
import {getAudioSampleStartFrameAtTimelineZero} from './trim-audio-sample-before-zero';
import {
	createWaveformPeakProcessor,
	emitWaveformProgress,
} from './waveform-peak-processor';
const DEFAULT_PROGRESS_INTERVAL_IN_MS = 50;

const peaksCache = new Map<string, Float32Array>();

export {TARGET_SAMPLE_RATE};

type Progress = {
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
	url: string,
	signal: AbortSignal,
	options?: LoadWaveformPeaksOptions,
): Promise<Float32Array> {
	const waveformSampleRate = options?.waveformSampleRate ?? TARGET_SAMPLE_RATE;
	if (!Number.isFinite(waveformSampleRate) || waveformSampleRate <= 0) {
		throw new Error('The waveform sample rate must be a positive number.');
	}

	const cacheKey = `${waveformSampleRate}:${url}`;
	const cached = peaksCache.get(cacheKey);
	if (cached) {
		emitWaveformProgress({
			peaks: cached,
			completedPeaks: cached.length,
			totalPeaks: cached.length,
			final: true,
			onProgress: options?.onProgress,
		});
		return cached;
	}

	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(url),
	});

	try {
		const audioTrack = await input.getPrimaryAudioTrack();
		if (!audioTrack) {
			return new Float32Array(0);
		}

		if (await audioTrack.isLive()) {
			throw new Error(
				'Live streams are not currently supported by Remotion. Sorry! Source: ' +
					url,
			);
		}

		if (await audioTrack.isRelativeToUnixEpoch()) {
			throw new Error(
				'Streams with UNIX timestamps are not currently supported by Remotion. Sorry! Source: ' +
					url,
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
				return new Float32Array(0);
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
			sample.close();

			processor.processSampleChunk(floats, channels);
		}

		processor.finalize();
		const {peaks} = processor;
		peaksCache.set(cacheKey, peaks);
		return peaks;
	} finally {
		input.dispose();
	}
}

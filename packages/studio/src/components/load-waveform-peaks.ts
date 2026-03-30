import {ALL_FORMATS, AudioSampleSink, Input, UrlSource} from 'mediabunny';

const TARGET_SAMPLE_RATE = 100;

const peaksCache = new Map<string, Float32Array>();

export {TARGET_SAMPLE_RATE};

export async function loadWaveformPeaks(
	url: string,
	signal: AbortSignal,
): Promise<Float32Array> {
	const cached = peaksCache.get(url);
	if (cached) return cached;

	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(url),
	});

	try {
		const audioTrack = await input.getPrimaryAudioTrack();
		if (!audioTrack) {
			return new Float32Array(0);
		}

		const {sampleRate} = audioTrack;
		const durationInSeconds = await audioTrack.computeDuration();
		const totalPeaks = Math.ceil(durationInSeconds * TARGET_SAMPLE_RATE);
		const samplesPerPeak = Math.floor(sampleRate / TARGET_SAMPLE_RATE);

		const peaks = new Float32Array(totalPeaks);
		let peakIndex = 0;
		let peakMax = 0;
		let sampleInPeak = 0;

		const sink = new AudioSampleSink(audioTrack);

		for await (const sample of sink.samples()) {
			if (signal.aborted) {
				sample.close();
				return new Float32Array(0);
			}

			const bytesNeeded = sample.allocationSize({
				format: 'f32',
				planeIndex: 0,
			});
			const floats = new Float32Array(bytesNeeded / 4);
			sample.copyTo(floats, {format: 'f32', planeIndex: 0});
			sample.close();

			for (let i = 0; i < floats.length; i++) {
				const abs = Math.abs(floats[i]);
				if (abs > peakMax) peakMax = abs;
				sampleInPeak++;

				if (sampleInPeak >= samplesPerPeak) {
					if (peakIndex < totalPeaks) {
						peaks[peakIndex] = peakMax;
					}

					peakIndex++;
					peakMax = 0;
					sampleInPeak = 0;
				}
			}
		}

		if (sampleInPeak > 0 && peakIndex < totalPeaks) {
			peaks[peakIndex] = peakMax;
		}

		peaksCache.set(url, peaks);
		return peaks;
	} finally {
		input.dispose();
	}
}

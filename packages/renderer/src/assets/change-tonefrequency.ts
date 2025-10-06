import {DEFAULT_SAMPLE_RATE} from '../sample-rate';
import {wsolaInt16Interleaved} from './change-tempo';
import {resampleAudioData} from './resample-audiodata';

export const NUMBER_OF_CHANNELS = 2;

export const applyToneFrequency = (
	numberOfFrames: number,
	audioData: Int16Array,
	toneFrequency: number,
): Int16Array => {
	// In FFmpeg, we apply toneFrequency as follows:
	// `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`
	// So there are 2 steps:
	// 1. Change the assumed sample rate
	// 2. Resample to 48Khz
	// 3. Apply playback rate

	const step1SampleRate = DEFAULT_SAMPLE_RATE * toneFrequency;

	const newNumberOfFrames = Math.round(
		numberOfFrames * (DEFAULT_SAMPLE_RATE / step1SampleRate),
	);

	const step2Data = new Int16Array(newNumberOfFrames * NUMBER_OF_CHANNELS);

	const chunkSize = numberOfFrames / newNumberOfFrames;

	resampleAudioData({
		sourceChannels: audioData,
		destination: step2Data,
		targetFrames: newNumberOfFrames,
		chunkSize,
	});

	const step3Data = wsolaInt16Interleaved(
		step2Data,
		NUMBER_OF_CHANNELS,
		toneFrequency,
	);

	return step3Data;
};

import {FORMAT, type PcmS16AudioData} from './convert-audiodata';
import {resampleAudioData, TARGET_SAMPLE_RATE} from './resample-audiodata';
import {atempoInt16Interleaved} from './wsola';

export const applyToneFrequency = (
	audioData: PcmS16AudioData,
	toneFrequency: number,
): PcmS16AudioData => {
	// In FFmpeg, we apply toneFrequency as follows:
	// `asetrate=${DEFAULT_SAMPLE_RATE}*${toneFrequency},aresample=${DEFAULT_SAMPLE_RATE},atempo=1/${toneFrequency}`
	// So there are 2 steps:
	// 1. Change the assumed sample rate
	// 2. Resample to 48Khz
	// 3. Apply playback rate

	const step1: PcmS16AudioData = {
		...audioData,
		sampleRate: audioData.sampleRate * toneFrequency,
	};

	const newNumberOfFrames = Math.round(
		audioData.numberOfFrames * (TARGET_SAMPLE_RATE / step1.sampleRate),
	);

	const step2Data = new Int16Array(
		newNumberOfFrames * audioData.numberOfChannels,
	);

	const chunkSize = audioData.numberOfFrames / newNumberOfFrames;

	resampleAudioData({
		srcNumberOfChannels: step1.numberOfChannels,
		sourceChannels: step1.data,
		destination: step2Data,
		targetFrames: newNumberOfFrames,
		chunkSize,
	});

	const step2AudioData = {
		data: step2Data,
		format: FORMAT,
		numberOfChannels: step1.numberOfChannels,
		numberOfFrames: newNumberOfFrames,
		sampleRate: TARGET_SAMPLE_RATE,
		timestamp: audioData.timestamp,
	};

	const step3Data = atempoInt16Interleaved(
		step2AudioData.data,
		step2AudioData.numberOfChannels,
		toneFrequency,
	);

	// Target per-channel length and interleave
	const targetPerChan = Math.max(
		1,
		Math.round(step2AudioData.numberOfFrames * toneFrequency),
	);
	const targetTotal = targetPerChan * step2AudioData.numberOfChannels;

	return {
		data: step3Data,
		numberOfChannels: step2AudioData.numberOfChannels,
		numberOfFrames: targetTotal,
		sampleRate: TARGET_SAMPLE_RATE,
		timestamp: audioData.timestamp,
	};
};

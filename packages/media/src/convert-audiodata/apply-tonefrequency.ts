import {FORMAT, type PcmS16AudioData} from './convert-audiodata';
import {resampleAudioData, TARGET_SAMPLE_RATE} from './resample-audiodata';

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

	const step3Data = new Int16Array(
		audioData.numberOfChannels * audioData.numberOfFrames,
	);

	const step3ChunkSize = newNumberOfFrames / audioData.numberOfFrames;

	resampleAudioData({
		srcNumberOfChannels: step2AudioData.numberOfChannels,
		sourceChannels: step2AudioData.data,
		destination: step3Data,
		targetFrames: audioData.numberOfFrames,
		chunkSize: step3ChunkSize,
	});

	console.log({step3ChunkSize, chunkSize});

	return {
		data: step3Data,
		numberOfChannels: step2AudioData.numberOfChannels,
		numberOfFrames: audioData.numberOfFrames,
		sampleRate: TARGET_SAMPLE_RATE,
		timestamp: audioData.timestamp,
	};
};

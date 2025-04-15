import {resampleAudioData} from '../../resample-audiodata';

const audioData = new AudioData({
	data: new Float32Array([1, 2, 3, 4, 5]),
	format: 'f32',
	numberOfChannels: 1,
	numberOfFrames: 5,
	sampleRate: 44100,
	timestamp: 0,
});

const resampledAudioData = resampleAudioData(audioData, 22050);
if (resampledAudioData.numberOfFrames !== 2) {
	throw new Error('Resampled audio data has wrong number of frames');
}

if (resampledAudioData.sampleRate !== 22050) {
	throw new Error('Resampled audio data has wrong sample rate');
}

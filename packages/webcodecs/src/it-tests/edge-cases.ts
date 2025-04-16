import {convertAudioData} from '../convert-audiodata';

try {
	// float32 must be within range of -1 to 1
	convertAudioData({
		audioData: new AudioData({
			data: new Float32Array([1, 2, 3, 4]),
			format: 'f32-planar',
			numberOfChannels: 1,
			numberOfFrames: 4,
			sampleRate: 22050,
			timestamp: 0,
		}),
		newSampleRate: 44100,
	});
	throw new Error('should not get this far ');
} catch (err) {
	if (
		!(
			err instanceof Error &&
			err.message === 'All values in a Float32 array must be between -1 and 1'
		)
	) {
		throw err;
	}
}

try {
	// result in 0 samples
	convertAudioData({
		audioData: new AudioData({
			data: new Float32Array([1, 2, 3, 4]),
			format: 'f32-planar',
			numberOfChannels: 1,
			numberOfFrames: 4,
			sampleRate: 22050,
			timestamp: 0,
		}),
		newSampleRate: 2000,
	});
	throw new Error('should not get this far ');
} catch (err) {
	if (
		!(
			err instanceof Error &&
			err.message ===
				'Cannot resample - the given sample rate would result in less than 1 sample'
		)
	) {
		throw err;
	}
}

try {
	// chrome sample rate limits
	convertAudioData({
		audioData: new AudioData({
			data: new Int32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
			format: 's32',
			numberOfChannels: 1,
			numberOfFrames: 10,
			sampleRate: 4000,
			timestamp: 0,
		}),
		newSampleRate: 2000,
	});
	throw new Error('should not get this far ');
} catch (err) {
	if (
		!(
			err instanceof Error &&
			err.message === 'newSampleRate must be between 3000 and 768000'
		)
	) {
		throw err;
	}
}

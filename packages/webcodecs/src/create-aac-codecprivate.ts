// codec private, for example [17, 144]
// audioObjectType = 2 = 'AAC LC'
// samplingFrequencyIndex = 3 = '48000 Hz'
// channelConfiguration = 2 = '2 channels'
/**
 * bytes 17,144: 00010 001 | 1 0010 000
                 ^^^^^ ^^^   ^ ^^^^ ^
                 |     |       |    | padding
                 |     |       |
                 |     |       +-- channelConfiguration (2)
                 |     +-- samplingFrequencyIndex (3)
                 +-- audioConfigType (2)
  */

// https://wiki.multimedia.cx/index.php/MPEG-4_Audio#Channel_Configurations
const getConfigForSampleRate = (sampleRate: number) => {
	if (sampleRate === 96000) {
		return 0;
	}

	if (sampleRate === 88200) {
		return 1;
	}

	if (sampleRate === 64000) {
		return 2;
	}

	if (sampleRate === 48000) {
		return 3;
	}

	if (sampleRate === 44100) {
		return 4;
	}

	if (sampleRate === 32000) {
		return 5;
	}

	if (sampleRate === 24000) {
		return 6;
	}

	if (sampleRate === 22050) {
		return 7;
	}

	if (sampleRate === 16000) {
		return 8;
	}

	if (sampleRate === 12000) {
		return 9;
	}

	if (sampleRate === 11025) {
		return 10;
	}

	if (sampleRate === 8000) {
		return 11;
	}

	if (sampleRate === 7350) {
		return 12;
	}

	throw new Error(`Unexpected sample rate ${sampleRate}`);
};

export const createAacCodecPrivate = ({
	audioObjectType,
	sampleRate,
	channelConfiguration,
}: {
	audioObjectType: number;
	sampleRate: number;
	channelConfiguration: number;
}) => {
	const bits = `${audioObjectType.toString(2).padStart(5, '0')}${getConfigForSampleRate(sampleRate).toString(2).padStart(4, '0')}${channelConfiguration.toString(2).padStart(4, '0')}000`;
	if (bits.length !== 16) {
		throw new Error('Invalid AAC codec private ' + bits.length);
	}

	if (channelConfiguration === 0 || channelConfiguration > 7) {
		throw new Error('Invalid channel configuration ' + channelConfiguration);
	}

	const firstByte = parseInt(bits.slice(0, 8), 2);
	const secondByte = parseInt(bits.slice(8, 16), 2);

	return new Uint8Array([firstByte, secondByte]);
};

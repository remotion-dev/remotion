export const getSampleRateFromSampleFrequencyIndex = (
	samplingFrequencyIndex: number,
) => {
	switch (samplingFrequencyIndex) {
		case 0:
			return 96000;
		case 1:
			return 88200;
		case 2:
			return 64000;
		case 3:
			return 48000;
		case 4:
			return 44100;
		case 5:
			return 32000;
		case 6:
			return 24000;
		case 7:
			return 22050;
		case 8:
			return 16000;
		case 9:
			return 12000;
		case 10:
			return 11025;
		case 11:
			return 8000;
		case 12:
			return 7350;
		default:
			throw new Error(
				`Unexpected sampling frequency index ${samplingFrequencyIndex}`,
			);
	}
};

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
	codecPrivate,
}: {
	audioObjectType: number;
	sampleRate: number;
	channelConfiguration: number;
	codecPrivate: Uint8Array | null;
}) => {
	if (codecPrivate !== null && codecPrivate.length > 2) {
		// Video submitted
		// submitted by Yossi Elkrief
		// TOOD: Check if we are now parsing correctly
		return codecPrivate;
	}

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

export const parseAacCodecPrivate = (bytes: Uint8Array) => {
	if (bytes.length < 2) {
		throw new Error('Invalid AAC codec private length');
	}

	const bits = [...bytes].map((b) => b.toString(2).padStart(8, '0')).join('');

	let offset = 0;
	const audioObjectType = parseInt(bits.slice(offset, offset + 5), 2);
	offset += 5;

	const samplingFrequencyIndex = parseInt(bits.slice(offset, offset + 4), 2);
	offset += 4;

	if (samplingFrequencyIndex === 0xf) {
		offset += 24;
	}

	const channelConfiguration = parseInt(bits.slice(offset, offset + 4), 2);
	offset += 4;

	if (audioObjectType === 5) {
		const extensionSamplingFrequencyIndex = parseInt(
			bits.slice(offset, offset + 4),
			2,
		);
		offset += 4;

		const newAudioObjectType = parseInt(bits.slice(offset, offset + 5), 2);
		offset += 5;

		return {
			audioObjectType: newAudioObjectType,
			sampleRate: getSampleRateFromSampleFrequencyIndex(
				extensionSamplingFrequencyIndex,
			),
			channelConfiguration,
		};
	}

	const sampleRate = getSampleRateFromSampleFrequencyIndex(
		samplingFrequencyIndex,
	);

	return {
		audioObjectType,
		sampleRate,
		channelConfiguration,
	};
};

export const mapAudioObjectTypeToCodecString = (audioObjectType: number) => {
	/**
 * 	1.	1 - mp4a.40.2: MPEG-4 AAC LC (Low Complexity)
	2.	2 - mp4a.40.5: MPEG-4 AAC HE (High Efficiency)
	3.	3 - mp4a.40.29: MPEG-4 AAC HEv2 (High Efficiency v2)
	4.	4 - mp4a.40.1: MPEG-4 AAC Main
	5.	5 - mp4a.40.3: MPEG-4 AAC SSR (Scalable Sample Rate)
	6.	6 - mp4a.40.4: MPEG-4 AAC LTP (Long Term Prediction)
	7.	17 - mp4a.40.17: MPEG-4 AAC LD (Low Delay)
	8.	23 - mp4a.40.23: MPEG-4 AAC ELD (Enhanced Low Delay)
 */

	switch (audioObjectType) {
		case 1:
			return 'mp4a.40.2';
		case 2:
			return 'mp4a.40.5';
		case 3:
			return 'mp4a.40.29';
		case 4:
			return 'mp4a.40.1';
		case 5:
			return 'mp4a.40.3';
		case 6:
			return 'mp4a.40.4';
		case 17:
			return 'mp4a.40.17';
		case 23:
			return 'mp4a.40.23';
		default:
			throw new Error(`Unexpected audio object type ${audioObjectType}`);
	}
};

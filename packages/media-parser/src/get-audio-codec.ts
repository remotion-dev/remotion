import type {MediaParserCodecData} from './codec-data';
import type {EsdsBox} from './containers/iso-base-media/esds/esds';
import type {AudioSample} from './containers/iso-base-media/stsd/samples';
import type {TrakBox} from './containers/iso-base-media/trak/trak';
import {getStsdBox} from './containers/iso-base-media/traversal';
import {
	getHasTracks,
	getTracks,
	type MediaParserAudioCodec,
} from './get-tracks';
import type {AnySegment} from './parse-result';
import type {ParserState} from './state/parser-state';

export const getAudioCodec = (
	parserState: ParserState,
): MediaParserAudioCodec | null => {
	const tracks = getTracks(parserState, true);

	if (tracks.length === 0) {
		throw new Error('No tracks yet');
	}

	const audioTrack = tracks.find((t) => t.type === 'audio');
	if (!audioTrack) {
		return null;
	}

	if (audioTrack.type === 'audio') {
		return audioTrack.codecEnum;
	}

	return null;
};

export const hasAudioCodec = (state: ParserState): boolean => {
	return getHasTracks(state, true);
};

const getCodecSpecificatorFromEsdsBox = ({
	child,
}: {
	child: EsdsBox;
}): {
	primary: number;
	secondary: number | null;
	description: Uint8Array | undefined;
} => {
	const descriptor = child.descriptors.find(
		(d) => d.type === 'decoder-config-descriptor',
	);
	if (!descriptor) {
		throw new Error('No decoder-config-descriptor');
	}

	if (descriptor.type !== 'decoder-config-descriptor') {
		throw new Error('Expected decoder-config-descriptor');
	}

	if (descriptor.asNumber !== 0x40) {
		return {
			primary: descriptor.asNumber,
			secondary: null,
			description: undefined,
		};
	}

	const audioSpecificConfig = descriptor.decoderSpecificConfigs.find((d) => {
		return d.type === 'mp4a-specific-config' ? d : null;
	});
	if (
		!audioSpecificConfig ||
		audioSpecificConfig.type !== 'mp4a-specific-config'
	) {
		throw new Error('No audio-specific-config');
	}

	return {
		primary: descriptor.asNumber,
		secondary: audioSpecificConfig.audioObjectType,
		description: audioSpecificConfig.asBytes,
	};
};

type AudioCodecInfo = {
	format: string;
	primarySpecificator: number | null;
	secondarySpecificator: number | null;
	description: Uint8Array | undefined;
};

export const getCodecPrivateFromTrak = (
	trakBox: TrakBox,
): MediaParserCodecData | null => {
	const stsdBox = getStsdBox(trakBox);
	if (!stsdBox) {
		return null;
	}

	const audioSample = stsdBox.samples.find((s) => s.type === 'audio');
	if (!audioSample || audioSample.type !== 'audio') {
		return null;
	}

	const esds = audioSample.children.find((b) => b.type === 'esds-box');
	if (!esds || esds.type !== 'esds-box') {
		return null;
	}

	const decoderConfigDescriptor = esds.descriptors.find(
		(d) => d.type === 'decoder-config-descriptor',
	);
	if (!decoderConfigDescriptor) {
		return null;
	}

	const mp4a = decoderConfigDescriptor.decoderSpecificConfigs.find(
		(d) => d.type === 'mp4a-specific-config',
	);
	if (!mp4a) {
		return null;
	}

	return {type: 'aac-config', data: mp4a.asBytes};
};

const onSample = (
	sample: AudioSample,
	children: AnySegment[],
): AudioCodecInfo | null => {
	const child = children.find((c) => c.type === 'esds-box');

	if (child && child.type === 'esds-box') {
		const ret = getCodecSpecificatorFromEsdsBox({child});
		return {
			format: sample.format,
			primarySpecificator: ret.primary,
			secondarySpecificator: ret.secondary,
			description: ret.description,
		};
	}

	return {
		format: sample.format,
		primarySpecificator: null,
		secondarySpecificator: null,
		description: undefined,
	};
};

export const getNumberOfChannelsFromTrak = (trak: TrakBox): number | null => {
	const stsdBox = getStsdBox(trak);
	if (!stsdBox) {
		return null;
	}

	const sample = stsdBox.samples.find((s) => s.type === 'audio');
	if (!sample || sample.type !== 'audio') {
		return null;
	}

	return sample.numberOfChannels;
};

export const getSampleRate = (trak: TrakBox): number | null => {
	const stsdBox = getStsdBox(trak);
	if (!stsdBox) {
		return null;
	}

	const sample = stsdBox.samples.find((s) => s.type === 'audio');
	if (!sample || sample.type !== 'audio') {
		return null;
	}

	return sample.sampleRate;
};

export const getAudioCodecFromTrak = (trak: TrakBox): AudioCodecInfo | null => {
	const stsdBox = getStsdBox(trak);
	if (!stsdBox) {
		return null;
	}

	const sample = stsdBox.samples.find((s) => s.type === 'audio');
	if (!sample || sample.type !== 'audio') {
		return null;
	}

	const waveBox = sample.children.find(
		(b) => b.type === 'regular-box' && b.boxType === 'wave',
	);
	if (waveBox && waveBox.type === 'regular-box' && waveBox.boxType === 'wave') {
		const esdsSample = onSample(sample, waveBox.children);
		if (esdsSample) {
			return esdsSample;
		}
	}

	const ret = onSample(sample, sample.children);
	if (ret) {
		return ret;
	}

	return null;
};

export const isLpcmAudioCodec = (trak: TrakBox): boolean => {
	return getAudioCodecFromTrak(trak)?.format === 'lpcm';
};

export const isIn24AudioCodec = (trak: TrakBox): boolean => {
	return getAudioCodecFromTrak(trak)?.format === 'in24';
};

export const isTwosAudioCodec = (trak: TrakBox): boolean => {
	return getAudioCodecFromTrak(trak)?.format === 'twos';
};

export const getAudioCodecStringFromTrak = (
	trak: TrakBox,
): {codecString: string; description: MediaParserCodecData | undefined} => {
	const codec = getAudioCodecFromTrak(trak);
	if (!codec) {
		throw new Error('Expected codec');
	}

	if (codec.format === 'lpcm') {
		return {
			codecString: 'pcm-s16',
			description: codec.description
				? {type: 'unknown-data', data: codec.description}
				: undefined,
		};
	}

	if (codec.format === 'twos') {
		return {
			codecString: 'pcm-s16',
			description: codec.description
				? {type: 'unknown-data', data: codec.description}
				: undefined,
		};
	}

	if (codec.format === 'in24') {
		return {
			codecString: 'pcm-s24',
			description: codec.description
				? {type: 'unknown-data', data: codec.description}
				: undefined,
		};
	}

	const codecStringWithoutMp3Exception = (
		[
			codec.format,
			codec.primarySpecificator ? codec.primarySpecificator.toString(16) : null,
			codec.secondarySpecificator
				? codec.secondarySpecificator.toString().padStart(2, '0')
				: null,
		].filter(Boolean) as string[]
	).join('.');

	// Really, MP3? 😔
	const codecString =
		codecStringWithoutMp3Exception.toLowerCase() === 'mp4a.6b' ||
		codecStringWithoutMp3Exception.toLowerCase() === 'mp4a.69'
			? 'mp3' // or "mp4a.6B" would also work, with the uppercasing, but mp3 is probably more obvious
			: codecStringWithoutMp3Exception;

	if (codecString === 'mp3') {
		return {
			codecString,
			description: codec.description
				? {
						type: 'unknown-data',
						data: codec.description,
					}
				: undefined,
		};
	}

	if (codecString.startsWith('mp4a.')) {
		return {
			codecString,
			description: codec.description
				? {
						type: 'aac-config',
						data: codec.description,
					}
				: undefined,
		};
	}

	return {
		codecString,
		description: codec.description
			? {
					type: 'unknown-data',
					data: codec.description,
				}
			: undefined,
	};
};

const getAudioCodecFromAudioCodecInfo = (
	codec: AudioCodecInfo,
): MediaParserAudioCodec => {
	if (codec.format === 'twos') {
		return 'pcm-s16';
	}

	if (codec.format === 'in24') {
		return 'pcm-s24';
	}

	if (codec.format === 'lpcm') {
		return 'pcm-s16';
	}

	if (codec.format === 'sowt') {
		return 'aiff';
	}

	if (codec.format === 'ac-3') {
		return 'ac3';
	}

	if (codec.format === 'Opus') {
		return 'opus';
	}

	if (codec.format === 'mp4a') {
		if (codec.primarySpecificator === 0x40) {
			return 'aac';
		}

		if (codec.primarySpecificator === 0x6b) {
			return 'mp3';
		}

		if (codec.primarySpecificator === null) {
			return 'aac';
		}

		throw new Error('Unknown mp4a codec: ' + codec.primarySpecificator);
	}

	throw new Error(`Unknown audio format: ${codec.format}`);
};

export const getAudioCodecFromTrack = (track: TrakBox) => {
	const audioSample = getAudioCodecFromTrak(track);
	if (!audioSample) {
		throw new Error('Could not find audio sample');
	}

	return getAudioCodecFromAudioCodecInfo(audioSample);
};

/* eslint-disable max-depth */
import type {EsdsBox} from './boxes/iso-base-media/esds/esds';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import type {AudioSample} from './boxes/iso-base-media/stsd/samples';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import type {MainSegment} from './boxes/webm/segments/main';
import {trakBoxContainsAudio} from './get-fps';
import type {KnownAudioCodecs} from './options';
import type {AnySegment} from './parse-result';
import {getMoovBox, getStsdBox, getTraks} from './traversal';

export const hasAudioCodec = (boxes: AnySegment[]): boolean => {
	try {
		return getAudioCodec(boxes) !== null;
	} catch (e) {
		return false;
	}
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
		return d.type === 'audio-specific-config' ? d : null;
	});
	if (
		!audioSpecificConfig ||
		audioSpecificConfig.type !== 'audio-specific-config'
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

export const getAudioCodecFromIso = (moov: MoovBox) => {
	const traks = getTraks(moov);
	const trakBox = traks.find(
		(b) => b.type === 'trak-box' && trakBoxContainsAudio(b),
	);
	if (!trakBox) {
		return null;
	}

	return getAudioCodecFromTrak(trakBox);
};

export const getAudioCodecFromMatroska = (mainSegment: MainSegment) => {
	const tracksSegment = mainSegment.children.find(
		(b) => b.type === 'tracks-segment',
	);
	if (!tracksSegment || tracksSegment.type !== 'tracks-segment') {
		return null;
	}

	for (const track of tracksSegment.children) {
		if (track.type === 'track-entry-segment') {
			const trackType = track.children.find((b) => b.type === 'codec-segment');
			if (trackType && trackType.type === 'codec-segment') {
				if (trackType.codec === 'A_OPUS') {
					return 'opus';
				}

				if (trackType.codec === 'A_VORBIS') {
					return 'vorbis';
				}

				if (trackType.codec === 'A_PCM/INT/LIT') {
					return 'pcm';
				}

				if (trackType.codec === 'A_AAC') {
					return 'aac';
				}
			}
		}
	}

	return null;
};

export const getAudioCodecStringFromTrak = (
	trak: TrakBox,
): {codecString: string; description: Uint8Array | undefined} => {
	const codec = getAudioCodecFromTrak(trak);
	if (!codec) {
		throw new Error('Expected codec');
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
		codecStringWithoutMp3Exception === 'mp4a.6b'
			? 'mp3' // or "mp4a.6B" would also work, with the uppercasing, but mp3 is probably more obvious
			: codecStringWithoutMp3Exception;

	return {
		codecString,
		description: codec.description,
	};
};

export const getAudioCodec = (boxes: AnySegment[]): KnownAudioCodecs | null => {
	const moovBox = getMoovBox(boxes);

	if (moovBox) {
		const codec = getAudioCodecFromIso(moovBox);

		if (!codec) {
			return null;
		}

		if (codec.format === 'sowt') {
			return 'aiff';
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

		throw new Error('Unknown audio format: ' + codec.format);
	}

	const mainSegment = boxes.find((b) => b.type === 'main-segment');
	if (!mainSegment || mainSegment.type !== 'main-segment') {
		return null;
	}

	return getAudioCodecFromMatroska(mainSegment);
};

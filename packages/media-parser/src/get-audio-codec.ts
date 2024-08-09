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

const getCodecSpecificatorFromEsdsBox = ({child}: {child: EsdsBox}): number => {
	const descriptor = child.descriptors.find(
		(d) => d.type === 'decoder-config-descriptor',
	);
	if (!descriptor) {
		throw new Error('No decoder-config-descriptor');
	}

	if (descriptor.type !== 'decoder-config-descriptor') {
		throw new Error('Expected decoder-config-descriptor');
	}

	return descriptor.asNumber;
};

type AudioCodecInfo = {
	format: string;
	specificator: number | null;
};

const onSample = (sample: AudioSample): AudioCodecInfo | null => {
	const child = sample.children.find((c) => c.type === 'esds-box');

	if (child && child.type === 'esds-box') {
		const ret = getCodecSpecificatorFromEsdsBox({child});
		return {format: sample.format, specificator: ret};
	}

	return {
		format: sample.format,
		specificator: null,
	};
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

	const ret = onSample(sample);
	if (ret) {
		return ret;
	}

	const waveBox = sample.children.find(
		(b) => b.type === 'regular-box' && b.boxType === 'wave',
	);
	if (waveBox && waveBox.type === 'regular-box' && waveBox.boxType === 'wave') {
		const esdsBox = waveBox.children.find((b) => b.type === 'esds-box');
		if (esdsBox && esdsBox.type === 'esds-box') {
			const ret2 = getCodecSpecificatorFromEsdsBox({child: esdsBox});
			if (ret2) {
				return {
					format: sample.format,
					specificator: ret2,
				};
			}

			return {
				format: sample.format,
				specificator: null,
			};
		}
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

				if (trackType.codec === 'A_PCM/INT/LIT') {
					return 'pcm';
				}
			}
		}
	}

	return null;
};

export const getAudioCodecStringFromTrak = (trak: TrakBox): string | null => {
	const codec = getAudioCodecFromTrak(trak);
	if (!codec) {
		return null;
	}

	return (
		[
			codec.format,
			codec.specificator ? codec.specificator.toString(16) : null,
		].filter(Boolean) as string[]
	).join('.');
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
			if (codec.specificator === 0x40) {
				return 'aac';
			}

			if (codec.specificator === 0x6b) {
				return 'mp3';
			}

			if (codec.specificator === null) {
				return 'aac';
			}

			throw new Error('Unknown mp4a codec: ' + codec.specificator);
		}

		throw new Error('Unknown audio format: ' + codec.format);
	}

	const mainSegment = boxes.find((b) => b.type === 'main-segment');
	if (!mainSegment || mainSegment.type !== 'main-segment') {
		return null;
	}

	return getAudioCodecFromMatroska(mainSegment);
};

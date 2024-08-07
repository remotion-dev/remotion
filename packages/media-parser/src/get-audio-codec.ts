/* eslint-disable max-depth */
import type {Sample} from './boxes/iso-base-media/stsd/samples';
import {trakBoxContainsAudio} from './get-fps';
import type {KnownAudioCodecs} from './options';
import type {AnySegment} from './parse-result';
import {getMoovBox, getStsdBox} from './traversal';

export const hasAudioCodec = (boxes: AnySegment[]): boolean => {
	try {
		return getAudioCodec(boxes) !== null;
	} catch (e) {
		return false;
	}
};

const onEsdsBox = (child: AnySegment): KnownAudioCodecs | null => {
	if (child && child.type === 'esds-box') {
		const descriptor = child.descriptors.find(
			(d) => d.type === 'decoder-config-descriptor',
		);
		if (descriptor && descriptor.type === 'decoder-config-descriptor') {
			return descriptor.objectTypeIndication;
		}
	}

	return null;
};

const onSample = (sample: Sample): KnownAudioCodecs | null | undefined => {
	if (!sample) {
		return null;
	}

	if (sample.type !== 'audio') {
		return null;
	}

	if (sample.format === 'sowt') {
		return 'aiff';
	}

	const child = sample.children.find((c) => c.type === 'esds-box');

	if (child && child.type === 'esds-box') {
		const ret = onEsdsBox(child);
		if (ret) {
			return ret;
		}
	}
};

export const getAudioCodec = (boxes: AnySegment[]): KnownAudioCodecs | null => {
	const moovBox = getMoovBox(boxes);

	if (moovBox) {
		const trakBox = moovBox.children.find(
			(b) => b.type === 'trak-box' && trakBoxContainsAudio(b),
		);
		if (trakBox && trakBox.type === 'trak-box') {
			const stsdBox = getStsdBox(trakBox);
			if (stsdBox) {
				const sample = stsdBox.samples.find((s) => s.type === 'audio');
				if (sample && sample.type === 'audio') {
					const ret = onSample(sample);
					if (ret) {
						return ret;
					}

					const waveBox = sample.children.find(
						(b) => b.type === 'regular-box' && b.boxType === 'wave',
					);
					if (
						waveBox &&
						waveBox.type === 'regular-box' &&
						waveBox.boxType === 'wave'
					) {
						const esdsBox = waveBox.children.find((b) => b.type === 'esds-box');
						if (esdsBox && esdsBox.type === 'esds-box') {
							const ret2 = onEsdsBox(esdsBox);
							if (ret2) {
								return ret2;
							}
						}
					}
				}
			}
		}
	}

	const mainSegment = boxes.find((b) => b.type === 'main-segment');
	if (!mainSegment || mainSegment.type !== 'main-segment') {
		return null;
	}

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

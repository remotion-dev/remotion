/* eslint-disable max-depth */
import {trakBoxContainsAudio} from './get-fps';
import type {KnownAudioCodecs} from './options';
import type {AnySegment} from './parse-result';

export const hasAudioCodec = (boxes: AnySegment[]): boolean => {
	try {
		return getAudioCodec(boxes) !== null;
	} catch (e) {
		return false;
	}
};

export const getAudioCodec = (boxes: AnySegment[]): KnownAudioCodecs | null => {
	const moovBox = boxes.find((b) => b.type === 'moov-box');
	if (moovBox && moovBox.type === 'moov-box') {
		const trakBox = moovBox.children.find(
			(b) => b.type === 'trak-box' && trakBoxContainsAudio(b),
		);
		if (trakBox && trakBox.type === 'trak-box') {
			const mdiaBox = trakBox.children.find(
				(b) => b.type === 'regular-box' && b.boxType === 'mdia',
			);
			if (
				mdiaBox &&
				mdiaBox.type === 'regular-box' &&
				mdiaBox.boxType === 'mdia'
			) {
				const minfBox = mdiaBox?.children.find(
					(b) => b.type === 'regular-box' && b.boxType === 'minf',
				);
				if (
					minfBox &&
					minfBox.type === 'regular-box' &&
					minfBox.boxType === 'minf'
				) {
					const stblBox = minfBox?.children.find(
						(b) => b.type === 'regular-box' && b.boxType === 'stbl',
					);
					if (stblBox && stblBox.type === 'regular-box') {
						const stsdBox = stblBox?.children.find(
							(b) => b.type === 'stsd-box',
						);
						if (stsdBox && stsdBox.type === 'stsd-box') {
							const videoSample = stsdBox.samples.find(
								(s) => s.type === 'audio',
							);
							if (videoSample && videoSample.type === 'audio') {
								if (videoSample.format === 'mp4a') {
									return 'aac';
								}
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
				// TODO: Add more codecs
			}
		}
	}

	return null;
};

import type {SamplePosition} from '../../get-sample-positions';
import {getTracksFromMoovBox} from '../../get-tracks';
import type {IsoBaseMediaSeekingInfo, SeekingInfo} from '../../seeking-info';
import type {ParserState} from '../../state/parser-state';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {TrakBox} from './trak/trak';
import {getMoovBoxFromState} from './traversal';

export const getSeekingInfoFromMp4 = (
	state: ParserState,
): SeekingInfo | null => {
	const moovAtom = getMoovBoxFromState(state);

	if (!moovAtom) {
		return null;
	}

	return {
		type: 'iso-base-media-seeking-info',
		moovBox: moovAtom,
	};
};

export const getSeekingByteFromIsoBaseMedia = (
	info: IsoBaseMediaSeekingInfo,
	time: number,
) => {
	const tracks = getTracksFromMoovBox(info.moovBox);
	const allTracks = [
		...tracks.videoTracks,
		...tracks.audioTracks,
		...tracks.otherTracks,
	];

	let byte = 0;
	let sam: SamplePosition | null = null;

	// TODO: Disregarding all moof boxes
	for (const t of allTracks) {
		const {timescale: ts, type} = t;
		if (type !== 'video') {
			continue;
		}

		const samplePositions = getSamplePositionsFromTrack({
			trakBox: t.trakBox as TrakBox,
			moofBoxes: [],
		});
		for (const sample of samplePositions) {
			const timestamp = sample.cts / ts;

			if (
				timestamp <= time &&
				byte < sample.offset &&
				type === 'video' &&
				sample.isKeyframe
			) {
				byte = sample.offset;
				sam = sample;
			}
		}
	}

	if (!sam) {
		throw new Error('No sample found');
	}

	return sam;
};

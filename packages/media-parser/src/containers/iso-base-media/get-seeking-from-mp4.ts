import type {SamplePosition} from '../../get-sample-positions';
import {getTracksFromMoovBox} from '../../get-tracks';
import type {IsoBaseMediaSeekingInfo, SeekingInfo} from '../../seeking-info';
import type {ParserState} from '../../state/parser-state';
import {getSamplePositionsFromTrack} from './get-sample-positions-from-track';
import type {TrakBox} from './trak/trak';
import {getMoofBoxes, getMoovBoxFromState} from './traversal';

export const getSeekingInfoFromMp4 = (
	state: ParserState,
): SeekingInfo | null => {
	const structure = state.getIsoStructure();
	const moovAtom = getMoovBoxFromState(state);
	const moofBoxes = getMoofBoxes(structure.boxes);

	if (!moovAtom) {
		return null;
	}

	return {
		type: 'iso-base-media-seeking-info',
		moovBox: moovAtom,
		moofBoxes,
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

	for (const t of allTracks) {
		const {timescale: ts, type} = t;
		if (type !== 'video') {
			continue;
		}

		const samplePositions = getSamplePositionsFromTrack({
			trakBox: t.trakBox as TrakBox,
			moofBoxes: info.moofBoxes,
		});

		for (const sample of samplePositions) {
			const ctsInSeconds = sample.cts / ts;
			const dtsInSeconds = sample.dts / ts;

			if (
				(ctsInSeconds <= time || dtsInSeconds <= time) &&
				byte <= sample.offset &&
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

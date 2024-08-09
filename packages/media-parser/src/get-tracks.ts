import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import {
	getTimescaleAndDuration,
	trakBoxContainsAudio,
	trakBoxContainsVideo,
} from './get-fps';
import type {SamplePosition} from './get-sample-positions';
import {getSamplePositions} from './get-sample-positions';
import {getVideoCodecString} from './get-video-codec';
import type {AnySegment} from './parse-result';
import {
	getCttsBox,
	getFtypBox,
	getMoovBox,
	getMvhdBox,
	getStcoBox,
	getStscBox,
	getStssBox,
	getStszBox,
	getSttsBox,
	getTkhdBox,
	getTraks,
	getVideoDescriptors,
} from './traversal';

export type VideoTrack = {
	type: 'video';
	samplePositions: SamplePosition[];
	trackId: number;
	description: Uint8Array | null;
	timescale: number;
	codecString: string | null;
};

export type AudioTrack = {
	type: 'audio';
	samplePositions: SamplePosition[];
	trackId: number;
	timescale: number;
	codecString: string | null;
};

export type Track = VideoTrack | AudioTrack;

// TODO: Use this to determine if all tracks are present
export const getNumberOfTracks = (moovBox: MoovBox): number => {
	const mvHdBox = getMvhdBox(moovBox);
	if (!mvHdBox) {
		return 0;
	}

	return mvHdBox.nextTrackId - 1;
};

export const hasTracks = (segments: AnySegment[]): boolean => {
	const moovBox = getMoovBox(segments);
	const ftypBox = getFtypBox(segments);

	if (!moovBox) {
		if (ftypBox) {
			return false;
		}

		// TODO: Support Matroska
		return true;
	}

	const numberOfTracks = getNumberOfTracks(moovBox);
	const tracks = getTraks(moovBox);

	return tracks.length === numberOfTracks;
};

export const getTracks = (
	segments: AnySegment[],
): {
	videoTracks: VideoTrack[];
	audioTracks: AudioTrack[];
} => {
	const moovBox = getMoovBox(segments);
	if (!moovBox) {
		return {
			videoTracks: [],
			audioTracks: [],
		};
	}

	const videoTracks: VideoTrack[] = [];
	const audioTracks: AudioTrack[] = [];
	const tracks = getTraks(moovBox);

	for (const track of tracks) {
		const stszBox = getStszBox(track);
		const stcoBox = getStcoBox(track);
		const stscBox = getStscBox(track);
		const stssBox = getStssBox(track);
		const sttsBox = getSttsBox(track);
		const tkhdBox = getTkhdBox(track);
		const cttsBox = getCttsBox(track);
		const videoDescriptors = getVideoDescriptors(track);
		const timescaleAndDuration = getTimescaleAndDuration(track);

		if (!tkhdBox) {
			throw new Error('Expected tkhd box in trak box');
		}

		if (!stszBox) {
			throw new Error('Expected stsz box in trak box');
		}

		if (!stcoBox) {
			throw new Error('Expected stco box in trak box');
		}

		if (!stscBox) {
			throw new Error('Expected stsc box in trak box');
		}

		if (!sttsBox) {
			throw new Error('Expected stts box in trak box');
		}

		if (!timescaleAndDuration) {
			throw new Error('Expected timescale and duration in trak box');
		}

		const samplePositions = getSamplePositions({
			stcoBox,
			stscBox,
			stszBox,
			stssBox,
			sttsBox,
			cttsBox,
		});

		if (trakBoxContainsAudio(track)) {
			audioTracks.push({
				type: 'audio',
				samplePositions,
				trackId: tkhdBox.trackId,
				timescale: timescaleAndDuration.timescale,
				codecString: null,
			});
		}

		if (trakBoxContainsVideo(track)) {
			videoTracks.push({
				type: 'video',
				samplePositions,
				trackId: tkhdBox.trackId,
				description: videoDescriptors,
				timescale: timescaleAndDuration.timescale,
				codecString: getVideoCodecString(track),
			});
		}
	}

	return {
		videoTracks,
		audioTracks,
	};
};

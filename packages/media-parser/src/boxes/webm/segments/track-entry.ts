import type {TrackEntry} from './all-segments';

export type TrackInfo = {
	codec: string;
	trackTimescale: number | null;
};

type TrackType =
	| 'video'
	| 'audio'
	| 'complex'
	| 'subtitle'
	| 'button'
	| 'control'
	| 'metadata';

export const trackTypeToString = (trackType: number): TrackType => {
	switch (trackType) {
		case 1:
			return 'video';
		case 2:
			return 'audio';
		case 3:
			return 'complex';
		case 4:
			return 'subtitle';
		case 5:
			return 'button';
		case 6:
			return 'control';
		case 7:
			return 'metadata';
		default:
			throw new Error(`Unknown track type: ${trackType}`);
	}
};

export type GetTracks = () => TrackEntry[];

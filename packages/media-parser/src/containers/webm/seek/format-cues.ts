import type {PossibleEbml} from '../segments/all-segments';

export type MatroskaCue = {
	trackId: number;
	timeInTimescale: number;
	clusterPositionInSegment: number;
	relativePosition: number;
};

export const formatCues = (cues: PossibleEbml[]) => {
	const matroskaCues: MatroskaCue[] = [];
	for (const cue of cues) {
		if (cue.type === 'Crc32') {
			continue;
		}

		if (cue.type !== 'CuePoint') {
			throw new Error('Expected CuePoint');
		}

		const cueTime = cue.value.find((_cue) => _cue.type === 'CueTime');
		if (!cueTime) {
			throw new Error('Expected CueTime');
		}

		const cueTrackPositions = cue.value.find(
			(c) => c.type === 'CueTrackPositions',
		);
		if (!cueTrackPositions) {
			throw new Error('Expected CueTrackPositions');
		}

		const cueTimeValue = cueTime.value.value;
		const cueTrack = cueTrackPositions.value.find(
			(_c) => _c.type === 'CueTrack',
		);
		if (!cueTrack) {
			throw new Error('Expected CueTrack');
		}

		const cueClusterPosition = cueTrackPositions.value.find(
			(_c) => _c.type === 'CueClusterPosition',
		);
		if (!cueClusterPosition) {
			throw new Error('Expected CueClusterPosition');
		}

		const cueRelativePosition = cueTrackPositions.value.find(
			(_c) => _c.type === 'CueRelativePosition',
		);

		const matroskaCue: MatroskaCue = {
			trackId: cueTrack.value.value,
			timeInTimescale: cueTimeValue,
			clusterPositionInSegment: cueClusterPosition.value.value,
			relativePosition: cueRelativePosition?.value.value ?? 0,
		};

		matroskaCues.push(matroskaCue);
	}

	return matroskaCues;
};

import {makeMatroskaBytes} from './matroska-utils';

export type Cue = {
	time: number;
	clusterPosition: number;
	trackNumber: number;
};

export const createMatroskaCues = (cues: Cue[]) => {
	return makeMatroskaBytes({
		type: 'Cues',
		minVintWidth: null,
		value: cues.map((cue) => {
			return {
				type: 'CuePoint',
				value: [
					{
						type: 'CueTime',
						minVintWidth: null,
						value: {
							value: cue.time,
							byteLength: null,
						},
					},
					{
						type: 'CueTrackPositions',
						value: [
							{
								type: 'CueTrack',
								minVintWidth: null,
								value: {
									value: cue.trackNumber,
									byteLength: null,
								},
							},
							{
								type: 'CueClusterPosition',
								minVintWidth: null,
								value: {
									value: cue.clusterPosition,
									byteLength: null,
								},
							},
						],
						minVintWidth: null,
					},
				],
				minVintWidth: null,
			};
		}),
	});
};

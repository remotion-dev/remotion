import {makeMatroskaBytes} from '../boxes/webm/make-header';
import type {PossibleEbml} from '../boxes/webm/segments/all-segments';
import {timestampToClusterTimestamp} from './cluster';

export type Cue = {
	time: number;
	clusterPosition: number;
	trackNumbers: number[];
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
							value: timestampToClusterTimestamp(cue.time),
							byteLength: null,
						},
					},
					...cue.trackNumbers.map(
						(trackNumber): PossibleEbml => ({
							type: 'CueTrackPositions',
							value: [
								{
									type: 'CueTrack',
									minVintWidth: null,
									value: {
										value: trackNumber,
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
						}),
					),
				],
				minVintWidth: null,
			};
		}),
	});
};

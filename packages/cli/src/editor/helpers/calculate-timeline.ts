import {TSequence} from 'remotion';

export type SequenceWithOverlap = {
	sequence: TSequence;
	overlaps: TSequence[];
};

export type Track = {
	trackId: string;
	sequences: TSequence[];
};

export const calculateTimeline = ({
	sequences,
	sequenceDuration,
}: {
	sequences: TSequence[];
	sequenceDuration: number;
}): Track[] => {
	const tracks: Track[] = [];

	if (sequences.length === 0) {
		return [
			{
				sequences: [
					{
						displayName: '',
						duration: sequenceDuration,
						from: 0,
						id: 'seq',
						parent: null,
						type: 'sequence',
					},
				],
				trackId: '0',
			},
		];
	}

	for (let i = 0; i < sequences.length; i++) {
		const sequence = sequences[i];
		if (!tracks[i]) {
			tracks[i] = {
				sequences: [],
				trackId: String(i),
			};
		}
		tracks[i].sequences.push(sequence);
	}
	return tracks;
};

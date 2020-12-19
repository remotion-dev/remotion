import {TSequence} from 'remotion';

export type SequenceWithOverlap = {
	sequence: TSequence;
	overlaps: TSequence[];
};

type Track = {
	trackId: number;
	sequences: SequenceWithOverlap[];
};

export const calculateOverlays = (
	sequences: TSequence[]
): SequenceWithOverlap[] => {
	return sequences.map((s) => {
		const overlaps = sequences
			.filter((otherS) => s.id !== otherS.id)
			.filter((otherS) => {
				const otherStart = otherS.from;
				const otherEnd = otherS.duration + otherStart;
				const thisStart = s.from;
				const thisEnd = s.duration + thisStart;
				if (otherStart < thisEnd && otherEnd > thisStart) {
					return true;
				}
				if (thisStart < otherEnd && thisEnd > otherStart) {
					return true;
				}
				return false;
			});
		return {
			sequence: s,
			overlaps,
		};
	});
};

export const numberOfOverlapsWithPrevious = (
	sequences: SequenceWithOverlap[],
	index: number
) => {
	const sequencesBefore = sequences.slice(0, index);
	const sequence = sequences[index];
	return sequence.overlaps.filter((overlap) => {
		return sequencesBefore.find((sb) => sb.sequence.id === overlap.id);
	}).length;
};

export const calculateTimeline = (sequences: TSequence[]) => {
	const sWithOverlays = calculateOverlays(sequences);
	const tracks: Track[] = [];

	for (let i = 0; i < sWithOverlays.length; i++) {
		const sequence = sWithOverlays[i];
		// Not showing nested sequences
		if (sequence.sequence.parent) {
			continue;
		}
		const overlayCount = numberOfOverlapsWithPrevious(sWithOverlays, i);
		if (!tracks[overlayCount]) {
			tracks[overlayCount] = {
				sequences: [],
				trackId: overlayCount,
			};
		}
		tracks[overlayCount].sequences.push(sequence);
	}
	return tracks;
};

import {TAsset, TSequence} from 'remotion';

export type SequenceWithOverlap = {
	sequence: TSequence;
	overlaps: TSequence[];
};

export type Track = {
	trackId: string;
	sequences: SequenceWithOverlap[];
	trackType: 'sequence' | 'audio';
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

const getAudioTracks = (
	assets: TAsset[],
	sequenceDuration: number
): Track[] => {
	return assets.map(
		(a, i): Track => {
			const fileNameSegments = a.src.split('/');
			return {
				sequences: [
					{
						overlaps: [],
						sequence: {
							displayName: fileNameSegments[fileNameSegments.length - 1],
							// TODO: WRONG
							duration: sequenceDuration,
							from: 0,
							id: `audio-${i}`,
							parent: null,
						},
					},
				],
				trackId: `audio-${i}`,
				trackType: 'audio',
			};
		}
	);
};

export const calculateTimeline = ({
	assets,
	sequences,
	sequenceDuration,
}: {
	assets: TAsset[];
	sequences: TSequence[];
	sequenceDuration: number;
}): Track[] => {
	const sWithOverlays = calculateOverlays(sequences);
	const tracks: Track[] = [];

	if (sWithOverlays.length === 0) {
		return [
			{
				sequences: [
					{
						overlaps: [],
						sequence: {
							displayName: '',
							duration: sequenceDuration,
							from: 0,
							id: 'seq',
							parent: null,
						},
					},
				],
				trackId: '0',
				trackType: 'sequence',
			},
			...getAudioTracks(assets, sequenceDuration),
		];
	}

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
				trackId: String(overlayCount),
				trackType: 'sequence',
			};
		}
		tracks[overlayCount].sequences.push(sequence);
	}
	tracks.push(...getAudioTracks(assets, sequenceDuration));
	return tracks;
};

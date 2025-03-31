import type {VideoTrack} from '../../../get-tracks';
import type {IsoBaseMediaBox} from '../base-media-box';
import type {TfraBox, TfraEntry} from './tfra';

export const findBestSegmentFromTfra = ({
	mfra,
	time,
	firstVideoTrack,
	timescale,
}: {
	mfra: IsoBaseMediaBox[];
	time: number;
	firstVideoTrack: VideoTrack;
	timescale: number;
}) => {
	const tfra = mfra.find(
		(b) => b.type === 'tfra-box' && b.trackId === firstVideoTrack.trackId,
	) as TfraBox;

	if (!tfra) {
		return null;
	}

	let bestSegment: TfraEntry | null = null;
	for (const segment of tfra.entries) {
		if (segment.time / timescale <= time) {
			bestSegment = segment;
		}
	}

	if (!bestSegment) {
		return null;
	}

	const currentSegmentIndex = tfra.entries.indexOf(bestSegment);

	const offsetOfNext =
		currentSegmentIndex === tfra.entries.length - 1
			? Infinity
			: tfra.entries[currentSegmentIndex + 1].moofOffset;

	return {
		start: bestSegment.moofOffset,
		end: offsetOfNext,
	};
};

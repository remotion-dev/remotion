import type {BufferIterator} from '../buffer-iterator';
import type {AvcProfileInfo} from '../containers/avc/parse-avc';
import type {OnTrackEntrySegment} from '../containers/webm/segments';
import type {TrackInfo} from '../containers/webm/segments/track-entry';
import {
	getTrackCodec,
	getTrackId,
	getTrackTimestampScale,
} from '../containers/webm/traversal';

export type SegmentSection = {
	start: number;
	size: number;
	index: number;
};

export type ClusterSection = {
	start: number;
	size: number;
	segment: number;
};

export const webmState = () => {
	const trackEntries: Record<number, TrackInfo> = {};

	const onTrackEntrySegment: OnTrackEntrySegment = (trackEntry) => {
		const trackId = getTrackId(trackEntry);
		if (!trackId) {
			throw new Error('Expected track id');
		}

		if (trackEntries[trackId]) {
			return;
		}

		const codec = getTrackCodec(trackEntry);
		if (!codec) {
			throw new Error('Expected codec');
		}

		const trackTimescale = getTrackTimestampScale(trackEntry);

		trackEntries[trackId] = {
			codec: codec.value,
			trackTimescale: trackTimescale?.value ?? null,
		};
	};

	const timestampMap = new Map<number, number>();

	const getTimestampOffsetForByteOffset = (byteOffset: number) => {
		const entries = Array.from(timestampMap.entries());
		const sortedByByteOffset = entries
			.sort((a, b) => {
				return a[0] - b[0];
			})
			.reverse();
		for (const [offset, timestamp] of sortedByByteOffset) {
			if (offset >= byteOffset) {
				continue;
			}

			return timestamp;
		}

		return timestampMap.get(byteOffset);
	};

	const setTimestampOffset = (byteOffset: number, timestamp: number) => {
		timestampMap.set(byteOffset, timestamp);
	};

	let timescale: number | null = null;

	const setTimescale = (newTimescale: number) => {
		timescale = newTimescale;
	};

	const getTimescale = () => {
		// https://www.matroska.org/technical/notes.html
		// When using the default value of TimestampScale of “1,000,000”, one Segment Tick represents one millisecond.
		if (timescale === null) {
			return 1_000_000;
		}

		return timescale;
	};

	const segments: SegmentSection[] = [];
	const clusters: ClusterSection[] = [];

	const avcProfilesMap: Record<number, AvcProfileInfo> = {};

	const setAvcProfileForTrackNumber = (
		trackNumber: number,
		avcProfile: AvcProfileInfo,
	) => {
		avcProfilesMap[trackNumber] = avcProfile;
	};

	const getAvcProfileForTrackNumber = (
		trackNumber: number,
	): AvcProfileInfo | null => {
		return avcProfilesMap[trackNumber] ?? null;
	};

	return {
		onTrackEntrySegment,
		getTrackInfoByNumber: (id: number) => trackEntries[id],
		setTimestampOffset,
		getTimestampOffsetForByteOffset,
		timescale,
		getTimescale,
		setTimescale,
		addSegment: (seg: Omit<SegmentSection, 'index'>) => {
			const segment: SegmentSection = {
				...seg,
				index: segments.length,
			};
			segments.push(segment);
		},
		addCluster: (cluster: ClusterSection) => {
			clusters.push(cluster);
		},
		isInsideSegment: (iterator: BufferIterator): SegmentSection | null => {
			const offset = iterator.counter.getOffset();
			const insideClusters = segments.filter((cluster) => {
				return (
					offset >= cluster.start && offset <= cluster.start + cluster.size
				);
			});
			if (insideClusters.length > 1) {
				throw new Error('Expected to only be inside 1 cluster');
			}

			return insideClusters[0] ?? null;
		},
		isInsideCluster: (iterator: BufferIterator): ClusterSection | null => {
			for (const cluster of clusters) {
				const offset = iterator.counter.getOffset();
				if (offset >= cluster.start && offset <= cluster.start + cluster.size) {
					return cluster;
				}
			}

			return null;
		},
		setAvcProfileForTrackNumber,
		getAvcProfileForTrackNumber,
	};
};

export type WebmState = ReturnType<typeof webmState>;

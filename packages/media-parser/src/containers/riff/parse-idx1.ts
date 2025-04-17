import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {Idx1Entry, RiffBox} from './riff-box';

const AVIIF_KEYFRAME = 0x00000010;

export const parseIdx1 = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): RiffBox => {
	const box = iterator.startBox(size);
	const offset = iterator.counter.getOffset();
	const entries: Idx1Entry[] = [];

	const sampleCounts: Record<number, number> = {};

	let videoTrackIndex: number | null = null;

	while (iterator.counter.getOffset() < offset + size) {
		const chunkId = iterator.getByteString(4, false);
		const flags = iterator.getUint32Le();
		const moffset = iterator.getUint32Le();
		const msize = iterator.getUint32Le();

		const chunk = chunkId.match(/^([0-9]{2})(wb|dc)$/);
		const isVideo = chunkId.endsWith('dc');
		if (isVideo) {
			videoTrackIndex = chunk ? parseInt(chunk[1], 10) : null;
		}

		const trackId = chunk ? parseInt(chunk[1], 10) : null;
		if (trackId === null) {
			continue;
		}

		if (!sampleCounts[trackId]) {
			sampleCounts[trackId] = 0;
		}

		const isKeyFrame = (flags & AVIIF_KEYFRAME) !== 0;

		if (isKeyFrame) {
			entries.push({
				flags,
				id: chunkId,
				offset: moffset,
				size: msize,
				sampleCounts: {...sampleCounts},
			});
		}

		sampleCounts[trackId]++;
	}

	box.expectNoMoreBytes();

	return {
		type: 'idx1-box',
		entries,
		videoTrackIndex,
	};
};

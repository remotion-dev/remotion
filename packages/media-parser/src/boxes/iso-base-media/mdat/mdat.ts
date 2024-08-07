import type {BufferIterator} from '../../../buffer-iterator';
import {getTracks} from '../../../get-tracks';
import type {AnySegment} from '../../../parse-result';

export interface MdatBox {
	type: 'mdat-box';
	boxSize: number;
}

export const parseMdat = ({
	data,
	size,
	fileOffset,
	existingBoxes,
}: {
	data: BufferIterator;
	size: number;
	fileOffset: number;
	existingBoxes: AnySegment[];
}): MdatBox => {
	// TODO: Do something cool with it
	const tracks = getTracks(existingBoxes);
	const flatSamples = tracks
		.map((track) => {
			return track.samplePositions.map((samplePosition) => {
				return {
					type: track.type,
					trackId: track.trackId,
					samplePosition,
				};
			});
		})
		.flat(1);

	while (true) {
		const sampleWithIndex = flatSamples.find((sample) => {
			return sample.samplePosition.offset === data.counter.getOffset();
		});
		if (!sampleWithIndex) {
			throw new Error('Could not find sample');
		}

		const bytes = data.getSlice(sampleWithIndex.samplePosition.size);
		console.log('found bytes', bytes.length, sampleWithIndex);
		const remaining = size - (data.counter.getOffset() - fileOffset);
		if (remaining === 0) {
			break;
		}
	}

	return {
		type: 'mdat-box',
		boxSize: size,
	};
};

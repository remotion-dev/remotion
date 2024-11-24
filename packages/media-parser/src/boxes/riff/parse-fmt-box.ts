import type {BufferIterator} from '../../buffer-iterator';
import type {RiffBox} from './riff-box';

export const parseFmtBox = ({
	iterator,
	boxes,
	size,
}: {
	iterator: BufferIterator;
	boxes: RiffBox[];
	size: number;
}): RiffBox => {
	const box = iterator.startBox(size);
	const header = boxes.find((b) => b.type === 'riff-header');
	if (!header) {
		throw new Error('Expected RIFF header');
	}

	if (header.fileType !== 'WAVE') {
		throw new Error('Only supporting WAVE type');
	}

	const wFormatTag = iterator.getUint16Le();
	if (wFormatTag !== 1) {
		throw new Error('Expected wFormatTag to be 1, only supporting this');
	}

	const numberOfChannels = iterator.getUint16Le();
	const sampleRate = iterator.getUint32Le();
	const byteRate = iterator.getUint32Le();
	const blockAlign = iterator.getUint16Le();
	const bitsPerSample = iterator.getUint16Le();

	box.expectNoMoreBytes();

	return {
		type: 'wave-format-box',
		formatTag: wFormatTag,
		numberOfChannels,
		sampleRate,
		blockAlign,
		byteRate,
		bitsPerSample,
	};
};

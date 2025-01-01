import type {BufferIterator} from '../../buffer-iterator';
import type {RiffBox} from './riff-box';

const parseStrfAudio = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): RiffBox => {
	const box = iterator.startBox(size);
	const formatTag = iterator.getUint16Le();
	const numberOfChannels = iterator.getUint16Le();
	const samplesPerSec = iterator.getUint32Le();
	const avgBytesPerSec = iterator.getUint32Le();
	const blockAlign = iterator.getUint16Le();
	const bitsPerSample = iterator.getUint16Le();
	const cbSize = iterator.getUint16Le();

	box.expectNoMoreBytes();

	return {
		type: 'strf-box-audio',
		avgBytesPerSecond: avgBytesPerSec,
		bitsPerSample,
		blockAlign,
		cbSize,
		formatTag,
		numberOfChannels,
		sampleRate: samplesPerSec,
	};
};

const parseStrfVideo = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): RiffBox => {
	const box = iterator.startBox(size);
	const biSize = iterator.getUint32Le();
	const width = iterator.getInt32Le();
	const height = iterator.getInt32Le();
	const planes = iterator.getUint16Le();
	const bitCount = iterator.getUint16Le();
	const compression = iterator.getByteString(4, false);
	const sizeImage = iterator.getUint32Le();
	const xPelsPerMeter = iterator.getInt32Le();
	const yPelsPerMeter = iterator.getInt32Le();
	const clrUsed = iterator.getUint32Le();
	const clrImportant = iterator.getUint32Le();

	box.expectNoMoreBytes();

	return {
		type: 'strf-box-video',
		biSize,
		bitCount,
		clrImportant,
		clrUsed,
		compression,
		height,
		planes,
		sizeImage,
		width,
		xPelsPerMeter,
		yPelsPerMeter,
	};
};

export const parseStrf = ({
	iterator,
	size,
	boxes,
}: {
	iterator: BufferIterator;
	size: number;
	boxes: RiffBox[];
}): RiffBox => {
	const strh = boxes.find((b) => b.type === 'strh-box');
	if (!strh) {
		throw new Error('strh box not found');
	}

	if (strh.fccType === 'vids') {
		return parseStrfVideo({iterator, size});
	}

	if (strh.fccType === 'auds') {
		return parseStrfAudio({iterator, size});
	}

	throw new Error(`Unsupported fccType: ${strh.fccType}`);
};

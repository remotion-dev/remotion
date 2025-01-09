import type {BufferIterator} from '../../buffer-iterator';
import type {RiffBox} from './riff-box';

export const parseStrh = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): RiffBox => {
	const box = iterator.startBox(size);
	const fccType = iterator.getByteString(4, false);
	if (fccType !== 'vids' && fccType !== 'auds') {
		throw new Error('Expected AVI handler to be vids / auds');
	}

	const handler =
		fccType === 'vids'
			? iterator.getByteString(4, false)
			: iterator.getUint32Le();
	if (typeof handler === 'string' && handler !== 'H264') {
		throw new Error(
			`Only H264 is supported as a stream type in .avi, got ${handler}`,
		);
	}

	if (fccType === 'auds' && handler !== 1) {
		throw new Error(
			`Only "1" is supported as a stream type in .avi, got ${handler}`,
		);
	}

	const flags = iterator.getUint32Le();
	const priority = iterator.getUint16Le();
	const language = iterator.getUint16Le();
	const initialFrames = iterator.getUint32Le();
	const scale = iterator.getUint32Le();
	const rate = iterator.getUint32Le();
	const start = iterator.getUint32Le();
	const length = iterator.getUint32Le();
	const suggestedBufferSize = iterator.getUint32Le();
	const quality = iterator.getUint32Le();
	const sampleSize = iterator.getUint32Le();

	box.discardRest();

	return {
		type: 'strh-box',
		fccType,
		handler,
		flags,
		priority,
		initialFrames,
		length,
		quality,
		rate,
		sampleSize,
		scale,
		start,
		suggestedBufferSize,
		language,
	};
};

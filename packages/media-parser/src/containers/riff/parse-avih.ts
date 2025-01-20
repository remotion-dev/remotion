import type {BufferIterator} from '../../buffer-iterator';
import type {RiffBox} from './riff-box';

export const parseAvih = ({
	iterator,
	size,
}: {
	iterator: BufferIterator;
	size: number;
}): RiffBox => {
	const {expectNoMoreBytes} = iterator.startBox(size);

	const dwMicroSecPerFrame = iterator.getUint32Le();
	const dwMaxBytesPerSec = iterator.getUint32Le();
	const paddingGranularity = iterator.getUint32Le();
	const flags = iterator.getUint32Le();
	const totalFrames = iterator.getUint32Le();
	const initialFrames = iterator.getUint32Le();
	const streams = iterator.getUint32Le();
	const suggestedBufferSize = iterator.getUint32Le();
	const width = iterator.getUint32Le();
	const height = iterator.getUint32Le();

	iterator.discard(16);

	expectNoMoreBytes();

	return {
		type: 'avih-box',
		microSecPerFrame: dwMicroSecPerFrame,
		maxBytesPerSecond: dwMaxBytesPerSec,
		paddingGranularity,
		flags,
		totalFrames,
		initialFrames,
		streams,
		suggestedBufferSize,
		height,
		width,
	};
};

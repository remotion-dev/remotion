import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {LogLevel} from '../../../log';
import type {AnySegment} from '../../../parse-result';
import type {VideoSectionState} from '../../../state/video-section';
import type {BaseBox} from '../base-type';
import {getIsoBaseMediaChildren} from '../get-children';

export interface MebxBox extends BaseBox {
	type: 'mebx-box';
	dataReferenceIndex: number;
	format: string;
	children: AnySegment[];
}

export const parseMebx = async ({
	offset,
	size,
	iterator,
	logLevel,
	videoSectionState,
}: {
	offset: number;
	size: number;
	iterator: BufferIterator;
	videoSectionState: VideoSectionState;
	logLevel: LogLevel;
}): Promise<MebxBox> => {
	// reserved, 6 bit
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();

	const children = await getIsoBaseMediaChildren({
		iterator,
		size: size - 8,
		logLevel,
		state: null,
		videoSectionState,
		callbacks: null,
	});

	return {
		type: 'mebx-box',
		boxSize: size,
		offset,
		dataReferenceIndex,
		format: 'mebx',
		children,
	};
};

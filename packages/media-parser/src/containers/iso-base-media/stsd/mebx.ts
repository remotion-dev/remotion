import type {BufferIterator} from '../../../iterator/buffer-iterator';
import type {LogLevel} from '../../../log';
import type {AnySegment} from '../../../parse-result';
import type {IsoBaseMediaState} from '../../../state/iso-base-media/iso-state';
import type {SampleCallbacks} from '../../../state/sample-callbacks';
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
	callbacks,
	isoState,
}: {
	offset: number;
	size: number;
	iterator: BufferIterator;
	videoSectionState: VideoSectionState;
	logLevel: LogLevel;
	callbacks: SampleCallbacks;
	isoState: IsoBaseMediaState;
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
		callbacks,
		isoState,
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

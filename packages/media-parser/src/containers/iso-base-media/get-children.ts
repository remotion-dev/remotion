import type {BufferIterator} from '../../iterator/buffer-iterator';
import type {LogLevel} from '../../log';
import type {IsoBaseMediaState} from '../../state/iso-base-media/iso-state';
import type {ParserState} from '../../state/parser-state';
import type {SampleCallbacks} from '../../state/sample-callbacks';
import {type VideoSectionState} from '../../state/video-section';
import type {IsoBaseMediaBox} from './base-media-box';
import {processBox} from './process-box';

export const getIsoBaseMediaChildren = async ({
	size,
	iterator,
	logLevel,
	state,
	videoSectionState,
	callbacks,
	isoState,
}: {
	size: number;
	iterator: BufferIterator;
	logLevel: LogLevel;
	state: ParserState | null;
	videoSectionState: VideoSectionState;
	callbacks: SampleCallbacks | null;
	isoState: IsoBaseMediaState;
}): Promise<IsoBaseMediaBox[]> => {
	const boxes: IsoBaseMediaBox[] = [];
	const initial = iterator.counter.getOffset();

	while (iterator.counter.getOffset() < size + initial) {
		const parsed = await processBox({
			iterator,
			logLevel,
			state,
			videoSectionState,
			callbacks,
			isoState,
		});
		if (!parsed) {
			throw new Error('Expected box');
		}

		boxes.push(parsed);
	}

	if (iterator.counter.getOffset() > size + initial) {
		throw new Error(
			`read too many bytes - size: ${size}, read: ${iterator.counter.getOffset() - initial}. initial offset: ${initial}`,
		);
	}

	return boxes;
};

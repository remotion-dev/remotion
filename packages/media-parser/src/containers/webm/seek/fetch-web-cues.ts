import type {MediaParserController} from '../../../controller/media-parser-controller';
import {getArrayBufferIterator} from '../../../iterator/buffer-iterator';
import type {LogLevel} from '../../../log';
import type {ParseMediaSrc} from '../../../options';
import type {ReaderInterface} from '../../../readers/reader';
import {expectSegment} from '../segments';
import type {PossibleEbml} from '../segments/all-segments';
import type {MatroskaCue} from './format-cues';
import {formatCues} from './format-cues';

export const fetchWebmCues = async ({
	src,
	readerInterface,
	controller,
	position,
	logLevel,
}: {
	src: ParseMediaSrc;
	readerInterface: ReaderInterface;
	controller: MediaParserController;
	position: number;
	logLevel: LogLevel;
}): Promise<MatroskaCue[] | null> => {
	const result = await readerInterface.read({
		controller,
		range: position,
		src,
	});
	const {value} = await result.reader.reader.read();
	if (!value) {
		return null;
	}

	result.reader.abort();
	const iterator = getArrayBufferIterator(value, value.length);
	const segment = await expectSegment({
		iterator,
		logLevel,
		statesForProcessing: null,
		isInsideSegment: null,
		mediaSectionState: null,
	});

	iterator.destroy();
	if (!segment?.value) {
		return null;
	}

	return formatCues(segment.value as PossibleEbml[]);
};

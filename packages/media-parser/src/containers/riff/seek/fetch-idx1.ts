import type {MediaParserController} from '../../../controller/media-parser-controller';
import {getArrayBufferIterator} from '../../../iterator/buffer-iterator';
import {Log, type LogLevel} from '../../../log';
import type {ParseMediaSrc} from '../../../options';
import type {ReaderInterface} from '../../../readers/reader';
import {expectRiffBox} from '../expect-riff-box';

export const fetchIdx1 = async ({
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
}) => {
	Log.verbose(
		logLevel,
		'Making request to fetch idx1 from ',
		src,
		'position',
		position,
	);
	const result = await readerInterface.read({
		controller,
		range: position,
		src,
	});

	const iterator = getArrayBufferIterator(new Uint8Array(), Infinity);
	while (true) {
		const res = await result.reader.reader.read();
		if (res.value) {
			iterator.addData(res.value);
		}

		if (res.done) {
			break;
		}
	}

	const box = await expectRiffBox({
		iterator,
		stateIfExpectingSideEffects: null,
	});

	iterator.destroy();
	return box;
};

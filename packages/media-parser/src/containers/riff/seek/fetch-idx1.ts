import type {MediaParserController} from '../../../controller/media-parser-controller';
import {getArrayBufferIterator} from '../../../iterator/buffer-iterator';
import type {LogLevel} from '../../../log';
import type {ParseMediaSrc} from '../../../options';
import type {ReaderInterface} from '../../../readers/reader';

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
	const result = await readerInterface.read({
		controller,
		range: position,
		src,
	});

	const iterator = getArrayBufferIterator(new Uint8Array(), null);
	while (true) {
		const res = await result.reader.reader.read();
		if (res.value) {
			iterator.addData(res.value);
		}

		if (res.done) {
			break;
		}
	}

	iterator.destroy();
};

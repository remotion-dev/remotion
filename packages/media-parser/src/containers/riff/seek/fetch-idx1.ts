import type {MediaParserController} from '../../../controller/media-parser-controller';
import type {PrefetchCache} from '../../../fetch';
import {getArrayBufferIterator} from '../../../iterator/buffer-iterator';
import {Log, type MediaParserLogLevel} from '../../../log';
import type {ParseMediaSrc} from '../../../options';
import type {MediaParserReaderInterface} from '../../../readers/reader';
import {expectRiffBox} from '../expect-riff-box';

export const fetchIdx1 = async ({
	src,
	readerInterface,
	controller,
	position,
	logLevel,
	prefetchCache,
	contentLength,
}: {
	src: ParseMediaSrc;
	readerInterface: MediaParserReaderInterface;
	controller: MediaParserController;
	position: number;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
	contentLength: number;
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
		logLevel,
		prefetchCache,
	});

	if (result.contentLength === null) {
		throw new Error('Content length is null');
	}

	const iterator = getArrayBufferIterator({
		initialData: new Uint8Array(),
		maxBytes: contentLength - position + 1,
		logLevel: 'error',
	});
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
	if (box === null || box.type !== 'idx1-box') {
		throw new Error('Expected idx1-box');
	}

	// only store video chunks, those end with "dc", e.g. "01dc"
	return {
		entries: box.entries.filter((entry) => entry.id.endsWith('dc')),
		videoTrackIndex: box.videoTrackIndex,
	};
};

export type FetchIdx1Result = Awaited<ReturnType<typeof fetchIdx1>>;

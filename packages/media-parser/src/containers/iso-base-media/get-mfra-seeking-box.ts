import type {MediaParserController} from '../../controller/media-parser-controller';
import type {PrefetchCache} from '../../fetch';
import type {MediaParserLogLevel} from '../../log';
import type {ParseMediaSrc} from '../../options';
import type {MediaParserReaderInterface} from '../../readers/reader';
import type {IsoBaseMediaBox} from './base-media-box';
import {getIsoBaseMediaChildren} from './get-children';
import {getMfraAtom} from './mfra/get-mfra-atom';
import {getMfroAtom} from './mfra/get-mfro-atom';

export type MfraSeekingBoxOptions = {
	contentLength: number;
	controller: MediaParserController;
	readerInterface: MediaParserReaderInterface;
	src: ParseMediaSrc;
	logLevel: MediaParserLogLevel;
	prefetchCache: PrefetchCache;
};

export const getMfraSeekingBox = async ({
	contentLength,
	controller,
	readerInterface,
	src,
	logLevel,
	prefetchCache,
}: MfraSeekingBoxOptions): Promise<IsoBaseMediaBox[] | null> => {
	const parentSize = await getMfroAtom({
		contentLength,
		controller,
		readerInterface,
		src,
		logLevel,
		prefetchCache,
	});
	if (!parentSize) {
		return null;
	}

	const mfraAtom = await getMfraAtom({
		contentLength,
		controller,
		readerInterface,
		src,
		parentSize,
		logLevel,
		prefetchCache,
	});

	mfraAtom.discard(8);

	return getIsoBaseMediaChildren({
		iterator: mfraAtom,
		logLevel,
		size: parentSize - 8,
		onlyIfMoovAtomExpected: null,
		contentLength,
	});
};

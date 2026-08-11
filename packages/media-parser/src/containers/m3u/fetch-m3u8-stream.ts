import type {MediaParserReaderInterface} from '../../readers/reader';
import {parseM3u8Text} from './parse-m3u8-text';
import type {M3uBox} from './types';

export const fetchM3u8Stream = async ({
	url,
	readerInterface,
}: {
	url: string;
	readerInterface: MediaParserReaderInterface;
}): Promise<M3uBox[]> => {
	const text = await readerInterface.readWholeAsText(url);

	const lines = text.split('\n');
	const boxes: M3uBox[] = [];
	for (const line of lines) {
		parseM3u8Text(line.trim(), boxes);
	}

	return boxes;
};

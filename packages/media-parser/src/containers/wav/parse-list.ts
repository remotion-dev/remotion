import type {MediaParserMetadataEntry} from '../../metadata/get-metadata';
import type {ParseResult} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import type {WavList} from './types';

export const parseList = ({
	state,
}: {
	state: ParserState;
}): Promise<ParseResult> => {
	const {iterator} = state;
	const ckSize = iterator.getUint32Le(); // chunkSize
	const box = iterator.startBox(ckSize);

	const startOffset = iterator.counter.getOffset();
	const type = iterator.getByteString(4, false);
	if (type !== 'INFO') {
		iterator.discard(ckSize - 4);
		return Promise.resolve(null);
	}

	const metadata: MediaParserMetadataEntry[] = [];

	const remainingBytes = () =>
		ckSize - (iterator.counter.getOffset() - startOffset);
	while (remainingBytes() > 0) {
		// Padding
		// https://discord.com/channels/809501355504959528/1308803317480292482/1343979547246333983
		// Indie_Hacker_Podcast (2).wav
		const byte = iterator.getUint8();
		if (byte === 0) {
			continue;
		}

		iterator.counter.decrement(1);

		const key = iterator.getByteString(4, false);
		const size = iterator.getUint32Le();
		const value = iterator.getByteString(size, true);
		metadata.push({
			key,
			trackId: null,
			value,
		});
	}

	const wavList: WavList = {
		type: 'wav-list',
		metadata,
	};

	state.structure.getWavStructure().boxes.push(wavList);

	box.expectNoMoreBytes();

	return Promise.resolve(null);
};

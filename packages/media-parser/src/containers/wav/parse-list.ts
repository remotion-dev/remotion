import type {MetadataEntry} from '../../metadata/get-metadata';
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
		throw new Error(`Only supporting LIST INFO, but got ${type}`);
	}

	const metadata: MetadataEntry[] = [];

	const remainingBytes = () =>
		ckSize - (iterator.counter.getOffset() - startOffset);
	while (remainingBytes() > 0) {
		// Padding
		// https://discord.com/channels/809501355504959528/1308803317480292482/1343979547246333983
		// Indie_Hacker_Podcast (2).wav
		if (remainingBytes() < 4) {
			iterator.discard(remainingBytes());
			break;
		}

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

	state.getWavStructure().boxes.push(wavList);

	box.expectNoMoreBytes();

	return Promise.resolve(null);
};

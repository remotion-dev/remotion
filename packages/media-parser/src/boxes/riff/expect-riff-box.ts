import type {BufferIterator} from '../../buffer-iterator';
import type {RiffStructure} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {isMoviAtom} from './is-movi';
import {parseMovi} from './parse-movi';
import {parseRiffBox} from './parse-riff-box';
import type {RiffBox} from './riff-box';

export type RiffResult =
	| {
			type: 'incomplete';
			continueParsing: () => Promise<RiffResult>;
	  }
	| {
			type: 'complete';
			box: RiffBox | null;
			skipTo: number | null;
	  };

export const expectRiffBox = async ({
	iterator,
	state,
	structure,
}: {
	iterator: BufferIterator;
	state: ParserState;
	structure: RiffStructure;
}): Promise<RiffResult> => {
	// Need at least 16 bytes to read LIST,size,movi,size
	if (iterator.bytesRemaining() < 16) {
		return {
			type: 'incomplete',
			continueParsing() {
				return expectRiffBox({structure, iterator, state});
			},
		};
	}

	const ckId = iterator.getByteString(4, false);
	const ckSize = iterator.getUint32Le();

	if (isMoviAtom(iterator, ckId)) {
		iterator.discard(4);

		return parseMovi({
			iterator,
			maxOffset: ckSize + iterator.counter.getOffset() - 4,
			state,
			structure,
		});
	}

	if (iterator.bytesRemaining() < ckSize) {
		iterator.counter.decrement(8);
		return {
			type: 'incomplete',
			continueParsing: () => {
				return expectRiffBox({structure, iterator, state});
			},
		};
	}

	return {
		type: 'complete',
		box: await parseRiffBox({
			id: ckId,
			iterator,
			size: ckSize,
			boxes: structure.boxes,
			state,
		}),
		skipTo: null,
	};
};

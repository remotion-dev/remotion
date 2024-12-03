import type {BufferIterator} from '../../buffer-iterator';
import type {RiffStructure} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
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
	options,
	structure,
}: {
	iterator: BufferIterator;
	options: ParserContext;
	structure: RiffStructure;
}): Promise<RiffResult> => {
	// Need at least 16 bytes to read LIST,size,movi,size
	if (iterator.bytesRemaining() < 16) {
		return {
			type: 'incomplete',
			continueParsing() {
				return expectRiffBox({structure, iterator, options});
			},
		};
	}

	const ckId = iterator.getByteString(4);
	const ckSize = iterator.getUint32Le();

	if (isMoviAtom(iterator, ckId)) {
		iterator.discard(4);

		return parseMovi({
			iterator,
			maxOffset: ckSize + iterator.counter.getOffset() - 4,
			options,
			structure,
		});
	}

	if (iterator.bytesRemaining() < ckSize) {
		iterator.counter.decrement(8);
		return {
			type: 'incomplete',
			continueParsing: () => {
				return expectRiffBox({structure, iterator, options});
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
			options,
		}),
		skipTo: null,
	};
};

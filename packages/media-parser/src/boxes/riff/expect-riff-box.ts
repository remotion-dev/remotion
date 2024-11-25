import type {BufferIterator} from '../../buffer-iterator';
import type {ParserContext} from '../../parser-context';
import {isMoviAtom} from './is-movi';
import {parseMovi} from './parse-movi';
import {parseRiffBox} from './parse-riff-box';
import type {RiffBox} from './riff-box';

export type RiffResult =
	| {
			type: 'incomplete';
			continueParsing: () => RiffResult;
	  }
	| {
			type: 'complete';
			box: RiffBox | null;
	  };

export const expectRiffBox = ({
	iterator,
	boxes,
	options,
}: {
	iterator: BufferIterator;
	boxes: RiffBox[];
	options: ParserContext;
}): RiffResult => {
	// Need at least 16 bytes to read LIST,size,movi,size
	if (iterator.bytesRemaining() < 16) {
		return {
			type: 'incomplete',
			continueParsing() {
				return expectRiffBox({boxes, iterator, options});
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
		});
	}

	// TODO: Add capability to read partially
	if (iterator.bytesRemaining() < ckSize) {
		iterator.counter.decrement(8);
		return {
			type: 'incomplete',
			continueParsing: () => {
				return expectRiffBox({boxes, iterator, options});
			},
		};
	}

	return {
		type: 'complete',
		box: parseRiffBox({id: ckId, iterator, size: ckSize, boxes, options}),
	};
};

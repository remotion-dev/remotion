import type {BufferIterator} from '../../buffer-iterator';
import type {LogLevel} from '../../log';
import type {Options, ParseMediaFields} from '../../options';
import type {IsoBaseMediaBox} from '../../parse-result';
import type {ParserState} from '../../state/parser-state';
import {parseIsoBaseMediaBoxes} from './parse-boxes';

export const getChildren = async ({
	boxType,
	iterator,
	bytesRemainingInBox,
	state,
	signal,
	logLevel,
	fields,
}: {
	boxType: string;
	iterator: BufferIterator;
	bytesRemainingInBox: number;
	state: ParserState;
	signal: AbortSignal | null;
	logLevel: LogLevel;
	fields: Options<ParseMediaFields>;
}): Promise<IsoBaseMediaBox[]> => {
	const parseChildren =
		boxType === 'mdia' ||
		boxType === 'minf' ||
		boxType === 'stbl' ||
		boxType === 'udta' ||
		boxType === 'moof' ||
		boxType === 'dims' ||
		boxType === 'meta' ||
		boxType === 'wave' ||
		boxType === 'traf' ||
		boxType === 'stsb';

	if (parseChildren) {
		const boxes: IsoBaseMediaBox[] = [];
		const parsed = await parseIsoBaseMediaBoxes({
			iterator,
			maxBytes: bytesRemainingInBox,
			allowIncompleteBoxes: false,
			initialBoxes: boxes,
			state,
			signal,
			logLevel,
			fields,
		});

		if (parsed.status === 'incomplete') {
			throw new Error('Incomplete boxes are not allowed');
		}

		return boxes;
	}

	if (bytesRemainingInBox < 0) {
		throw new Error('Box size is too big ' + JSON.stringify({boxType}));
	}

	iterator.discard(bytesRemainingInBox);
	return [];
};

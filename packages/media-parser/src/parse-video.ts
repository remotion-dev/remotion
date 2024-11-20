import {parseBoxes} from './boxes/iso-base-media/process-box';
import {parseWebm} from './boxes/webm/parse-webm-header';
import type {BufferIterator} from './buffer-iterator';
import {Log, type LogLevel} from './log';
import type {IsoBaseMediaBox, ParseResult} from './parse-result';
import type {ParserContext} from './parser-context';

export type PartialMdatBox = {
	type: 'partial-mdat-box';
	boxSize: number;
	fileOffset: number;
};

export type BoxAndNext =
	| {
			type: 'complete';
			box: IsoBaseMediaBox;
			size: number;
			skipTo: number | null;
	  }
	| {
			type: 'incomplete';
	  }
	| PartialMdatBox;

export const parseVideo = ({
	iterator,
	options,
	signal,
	logLevel,
}: {
	iterator: BufferIterator;
	options: ParserContext;
	signal: AbortSignal | null;
	logLevel: LogLevel;
}): Promise<ParseResult> => {
	if (iterator.bytesRemaining() === 0) {
		return Promise.resolve({
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return parseVideo({
					iterator,
					options,
					signal,
					logLevel,
				});
			},
			skipTo: null,
		});
	}

	if (iterator.isRiff()) {
		throw new Error('AVI files are not yet supported');
	}

	if (iterator.isIsoBaseMedia()) {
		Log.verbose(logLevel, 'Detected ISO Base Media container');
		return parseBoxes({
			iterator,
			maxBytes: Infinity,
			allowIncompleteBoxes: true,
			initialBoxes: [],
			options,
			continueMdat: false,
			signal,
			logLevel,
		});
	}

	if (iterator.isWebm()) {
		Log.verbose(logLevel, 'Detected Matroska container');
		return Promise.resolve(parseWebm(iterator, options));
	}

	if (iterator.isMp3()) {
		return Promise.reject(new Error('MP3 files are not yet supported'));
	}

	return Promise.reject(new Error('Unknown video format'));
};

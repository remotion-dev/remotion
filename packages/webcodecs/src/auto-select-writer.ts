import {bufferWriter} from '@remotion/media-parser/buffer';
import {canUseWebFsWriter, webFsWriter} from '@remotion/media-parser/web-fs';

import type {WriterInterface} from '@remotion/media-parser';
import type {LogLevel} from './log';
import {Log} from './log';

export const autoSelectWriter = async (
	writer: WriterInterface | undefined,
	logLevel: LogLevel,
): Promise<WriterInterface> => {
	if (writer) {
		Log.verbose(logLevel, 'Using writer provided by user');
		return writer;
	}

	Log.verbose(logLevel, 'Determining best writer');
	if (await canUseWebFsWriter()) {
		Log.verbose(logLevel, 'Using WebFS writer because it is supported');
		return webFsWriter;
	}

	Log.verbose(
		logLevel,
		'Using buffer writer because WebFS writer is not supported',
	);
	return bufferWriter;
};

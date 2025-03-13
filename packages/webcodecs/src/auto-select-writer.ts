import {canUseWebFsWriter, webFsWriter} from './writers/web-fs';

import type {WriterInterface} from '@remotion/media-parser';
import {withResolvers} from './create/with-resolvers';
import type {LogLevel} from './log';
import {Log} from './log';
import {bufferWriter} from './writers/buffer';

export const autoSelectWriter = async (
	writer: WriterInterface | undefined,
	logLevel: LogLevel,
): Promise<WriterInterface> => {
	if (writer) {
		Log.verbose(logLevel, 'Using writer provided by user');
		return writer;
	}

	Log.verbose(logLevel, 'Determining best writer');

	const hasNavigator = typeof navigator !== 'undefined';
	if (!hasNavigator) {
		Log.verbose(logLevel, 'No navigator API detected, using buffer writer');
		return bufferWriter;
	}

	// Check if we're offline using the navigator API
	const isOffline = !navigator.onLine;

	if (isOffline) {
		Log.verbose(logLevel, 'Offline mode detected, using buffer writer');
		return bufferWriter;
	}

	try {
		const {promise: timeout, reject, resolve} = withResolvers<void>();
		const time = setTimeout(
			() => reject(new Error('WebFS check timeout')),
			2000,
		);

		const webFsSupported = await Promise.race([canUseWebFsWriter(), timeout]);
		resolve();
		clearTimeout(time);

		if (webFsSupported) {
			Log.verbose(logLevel, 'Using WebFS writer because it is supported');
			return webFsWriter;
		}
	} catch (err) {
		Log.verbose(
			logLevel,
			`WebFS check failed: ${err}. Falling back to buffer writer`,
		);
	}

	Log.verbose(
		logLevel,
		'Using buffer writer because WebFS writer is not supported or unavailable',
	);
	return bufferWriter;
};

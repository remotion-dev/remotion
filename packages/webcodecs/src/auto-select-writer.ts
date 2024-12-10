import {canUseWebFsWriter, webFsWriter} from '@remotion/media-parser/web-fs';

import {Log} from './log';
import type {LogLevel} from './log';
import type {WriterInterface} from '@remotion/media-parser';
import {bufferWriter} from '@remotion/media-parser/buffer';

export const autoSelectWriter = async (
  writer: WriterInterface | undefined,
  logLevel: LogLevel,
): Promise<WriterInterface> => {
  if (writer) {
    Log.verbose(logLevel, 'Using writer provided by user');
    return writer;
  }

  Log.verbose(logLevel, 'Determining best writer');

  // Check if we're offline using the navigator API
  const isOffline = !navigator.onLine;
  
  if (isOffline) {
    Log.verbose(logLevel, 'Offline mode detected, using buffer writer');
    return bufferWriter;
  }

  try {
    const webFsSupported = await Promise.race([
      canUseWebFsWriter(),
      // Add a timeout to avoid hanging in PWA
      new Promise<boolean>((_, reject) => 
        setTimeout(() => reject(new Error('WebFS check timeout')), 3000)
      )
    ]);

    if (webFsSupported) {
      Log.verbose(logLevel, 'Using WebFS writer because it is supported');
      return webFsWriter;
    }
  } catch (err) {
    Log.verbose(logLevel, `WebFS check failed: ${err}. Falling back to buffer writer`);
  }

  Log.verbose(
    logLevel,
    'Using buffer writer because WebFS writer is not supported or unavailable',
  );
  return bufferWriter;
};
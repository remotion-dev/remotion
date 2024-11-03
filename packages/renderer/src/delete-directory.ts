import fs, {existsSync} from 'node:fs';
import {isServeUrl} from './is-serve-url';

export const deleteDirectory = (directory: string): void => {
	if (isServeUrl(directory)) {
		return;
	}

	if (!existsSync(directory)) {
		return;
	}

	// Working around a bug with NodeJS 16 on Windows:
	// If a subdirectory is already deleted, it will fail with EPERM
	// even with force: true and recursive and maxRetries set higher.
	// This is even with the fixWinEPERMSync function being called by Node.JS.

	// This is a workaround for this issue.
	let retries = 2;
	while (retries >= 0) {
		try {
			fs.rmSync(directory, {
				maxRetries: 2,
				recursive: true,
				force: true,
				retryDelay: 100,
			});
		} catch {
			retries--;
			continue;
		}

		break;
	}
};

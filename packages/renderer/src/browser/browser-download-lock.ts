import {randomUUID} from 'node:crypto';
import * as fs from 'node:fs';
import os from 'node:os';

const RETRY_INTERVAL_IN_MS = 100;
const STALE_LOCK_IN_MS = 30_000;
const HEARTBEAT_INTERVAL_IN_MS = 5_000;

type LockContents = {
	hostname: string;
	pid: number;
	token: string;
};

const wait = (timeoutInMilliseconds: number): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(resolve, timeoutInMilliseconds);
	});
};

const isErrorWithCode = (error: unknown, code: string): boolean => {
	return (
		error instanceof Error &&
		'code' in error &&
		(error as NodeJS.ErrnoException).code === code
	);
};

const readLock = async (lockPath: string): Promise<LockContents | null> => {
	try {
		const parsed = JSON.parse(
			await fs.promises.readFile(lockPath, 'utf8'),
		) as Partial<LockContents>;

		if (
			typeof parsed.hostname !== 'string' ||
			typeof parsed.pid !== 'number' ||
			typeof parsed.token !== 'string'
		) {
			return null;
		}

		return parsed as LockContents;
	} catch {
		return null;
	}
};

const isProcessRunning = (pid: number): boolean => {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return !isErrorWithCode(error, 'ESRCH');
	}
};

const removeStaleLock = async (lockPath: string): Promise<void> => {
	let stats: fs.Stats;
	try {
		stats = await fs.promises.stat(lockPath);
	} catch (error) {
		if (isErrorWithCode(error, 'ENOENT')) {
			return;
		}

		throw error;
	}

	const lock = await readLock(lockPath);
	if (lock?.hostname === os.hostname()) {
		if (isProcessRunning(lock.pid)) {
			return;
		}
	} else if (Date.now() - stats.mtimeMs < STALE_LOCK_IN_MS) {
		return;
	}

	try {
		await fs.promises.unlink(lockPath);
	} catch (error) {
		if (!isErrorWithCode(error, 'ENOENT')) {
			throw error;
		}
	}
};

export const acquireBrowserDownloadLock = async (
	lockPath: string,
): Promise<() => Promise<void>> => {
	// Browser archives and extraction directories are shared by every Remotion
	// process in a project, so the whole installation must be cross-process safe.
	for (;;) {
		const token = randomUUID();
		let lockFile: fs.promises.FileHandle;

		try {
			lockFile = await fs.promises.open(lockPath, 'wx');
		} catch (error) {
			if (!isErrorWithCode(error, 'EEXIST')) {
				throw error;
			}

			await removeStaleLock(lockPath);
			await wait(RETRY_INTERVAL_IN_MS);
			continue;
		}

		try {
			await lockFile.writeFile(
				JSON.stringify({
					hostname: os.hostname(),
					pid: process.pid,
					token,
				} satisfies LockContents),
			);
		} catch (error) {
			await lockFile.close();
			await fs.promises.rm(lockPath, {force: true});
			throw error;
		}

		const heartbeat = setInterval(async () => {
			const currentLock = await readLock(lockPath);
			if (currentLock?.token !== token) {
				return;
			}

			const now = new Date();
			try {
				await fs.promises.utimes(lockPath, now, now);
			} catch {
				// The lock may have been cleaned up while the heartbeat was pending.
			}
		}, HEARTBEAT_INTERVAL_IN_MS);
		heartbeat.unref();

		return async () => {
			clearInterval(heartbeat);
			const currentLock = await readLock(lockPath);
			await lockFile.close();

			if (currentLock?.token === token) {
				await fs.promises.rm(lockPath, {force: true});
			}
		};
	}
};

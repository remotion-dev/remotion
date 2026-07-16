import {execFile} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {
	mkdir,
	open,
	readFile,
	rename,
	rm,
	stat,
	writeFile,
} from 'node:fs/promises';
import {dirname, isAbsolute, join, resolve} from 'node:path';
import {promisify} from 'node:util';
import {
	STATE_VERSION,
	type MonitorState,
	type RepositoryContext,
} from './types';

const execFileAsync = promisify(execFile);
const LOCK_STALE_MS = 60_000;

const runGit = async (cwd: string, args: string[]) => {
	const result = await execFileAsync('git', args, {
		cwd,
		encoding: 'utf8',
		maxBuffer: 10 * 1024 * 1024,
	});
	return result.stdout.trim();
};

const parseGitHubRepository = (remote: string) => {
	const normalized = remote.trim().replace(/\.git$/, '');
	const match = normalized.match(/(?:github\.com[/:])([^/\s]+)\/([^/\s]+)$/i);
	if (!match) {
		throw new Error(`The origin remote is not a GitHub repository: ${remote}`);
	}
	return `${match[1]}/${match[2]}`;
};

export const getRepositoryContext = async (
	cwd: string,
): Promise<RepositoryContext> => {
	const [root, commonGitDir, remote] = await Promise.all([
		runGit(cwd, ['rev-parse', '--show-toplevel']),
		runGit(cwd, ['rev-parse', '--git-common-dir']),
		runGit(cwd, ['config', '--get', 'remote.origin.url']),
	]);
	return {
		root,
		commonGitDir: isAbsolute(commonGitDir)
			? commonGitDir
			: resolve(cwd, commonGitDir),
		repository: parseGitHubRepository(remote),
	};
};

export const getStatePath = (repository: RepositoryContext) =>
	join(repository.commonGitDir, 'pi', 'pullfrog-monitor', 'state.json');

export const reviewKey = (repository: string, prNumber: number) =>
	`${repository}#${prNumber}`;

export const createEmptyState = (): MonitorState => ({
	version: STATE_VERSION,
	reviews: {},
});

export const readState = async (path: string): Promise<MonitorState> => {
	try {
		const parsed = JSON.parse(
			await readFile(path, 'utf8'),
		) as Partial<MonitorState>;
		if (
			parsed.version !== STATE_VERSION ||
			!parsed.reviews ||
			typeof parsed.reviews !== 'object'
		) {
			return createEmptyState();
		}
		return parsed as MonitorState;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return createEmptyState();
		}
		if (error instanceof SyntaxError) {
			await rename(path, `${path}.corrupt-${Date.now()}`).catch(
				() => undefined,
			);
			return createEmptyState();
		}
		throw error;
	}
};

const writeState = async (path: string, state: MonitorState) => {
	await mkdir(dirname(path), {recursive: true});
	const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
	await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
	await rename(temporary, path);
};

const wait = (milliseconds: number) =>
	new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

type LockOwner = {pid: number; token: string};

const readLockOwner = async (lockPath: string): Promise<LockOwner | null> => {
	try {
		const value = JSON.parse(
			await readFile(join(lockPath, 'owner.json'), 'utf8'),
		) as Partial<LockOwner>;
		return typeof value.pid === 'number' && typeof value.token === 'string'
			? (value as LockOwner)
			: null;
	} catch {
		return null;
	}
};

const isProcessAlive = (pid: number) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === 'EPERM';
	}
};

const acquireStateLock = async (path: string) => {
	const lockPath = `${path}.lock`;
	await mkdir(dirname(path), {recursive: true});
	for (let attempt = 0; attempt < 200; attempt++) {
		const token = randomUUID();
		try {
			await mkdir(lockPath);
			const handle = await open(join(lockPath, 'owner.json'), 'w');
			await handle.writeFile(JSON.stringify({pid: process.pid, token}));
			await handle.close();
			return async () => {
				const owner = await readLockOwner(lockPath);
				if (owner?.token === token) {
					await rm(lockPath, {recursive: true, force: true});
				}
			};
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
				throw error;
			}
			const [info, owner] = await Promise.all([
				stat(lockPath).catch(() => null),
				readLockOwner(lockPath),
			]);
			const stale = info && Date.now() - info.mtimeMs > LOCK_STALE_MS;
			if (stale || (owner && !isProcessAlive(owner.pid))) {
				await rm(lockPath, {recursive: true, force: true}).catch(
					() => undefined,
				);
				continue;
			}
			await wait(50);
		}
	}
	throw new Error('Timed out waiting for the Pullfrog monitor state lock');
};

export const updateState = async <T>(
	path: string,
	update: (state: MonitorState) => T | Promise<T>,
): Promise<{state: MonitorState; result: T}> => {
	const release = await acquireStateLock(path);
	try {
		const state = await readState(path);
		const result = await update(state);
		await writeState(path, state);
		return {state, result};
	} finally {
		await release();
	}
};

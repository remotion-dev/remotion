import {execFile} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdir, readdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import type {RepositoryContext} from './types';

const execFileAsync = promisify(execFile);
const STALE_WORKTREE_MS = 24 * 60 * 60_000;

const runGit = async (cwd: string, args: string[]) => {
	const result = await execFileAsync('git', args, {
		cwd,
		encoding: 'utf8',
		maxBuffer: 20 * 1024 * 1024,
	});
	return result.stdout.trim();
};

const safeSegment = (value: string) =>
	value.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 120);

const isProcessAlive = (pid: number) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === 'EPERM';
	}
};

const baseDirectory = (repository: RepositoryContext) =>
	join(
		homedir(),
		'.pi',
		'agent',
		'pullfrog-worktrees',
		safeSegment(repository.repository),
	);

const ensureCommit = async (
	repository: RepositoryContext,
	prNumber: number,
	commit: string,
) => {
	const exists = await runGit(repository.root, [
		'cat-file',
		'-e',
		`${commit}^{commit}`,
	])
		.then(() => true)
		.catch(() => false);
	if (!exists) {
		await runGit(repository.root, ['fetch', 'origin', `pull/${prNumber}/head`]);
		await runGit(repository.root, ['cat-file', '-e', `${commit}^{commit}`]);
	}
};

export type ReviewWorktree = {
	checkout: string;
	remove: () => Promise<void>;
};

export const createReviewWorktree = async (
	repository: RepositoryContext,
	prNumber: number,
	headSha: string,
): Promise<ReviewWorktree> => {
	await ensureCommit(repository, prNumber, headSha);
	const directory = join(
		baseDirectory(repository),
		`pr-${prNumber}-${randomUUID()}`,
	);
	const checkout = join(directory, 'checkout');
	const remove = async () => {
		await runGit(repository.root, [
			'worktree',
			'remove',
			'--force',
			checkout,
		]).catch(() => undefined);
		await rm(directory, {recursive: true, force: true});
	};
	await mkdir(directory, {recursive: true});
	try {
		await runGit(repository.root, [
			'-c',
			'core.hooksPath=/dev/null',
			'worktree',
			'add',
			'--detach',
			checkout,
			headSha,
		]);
		await writeFile(
			join(directory, 'owner.json'),
			`${JSON.stringify({
				repository: repository.repository,
				prNumber,
				headSha,
				pid: process.pid,
				createdAt: new Date().toISOString(),
			})}\n`,
			'utf8',
		);
		return {checkout, remove};
	} catch (error) {
		await remove();
		throw error;
	}
};

export const cleanStaleReviewWorktrees = async (
	repository: RepositoryContext,
) => {
	const base = baseDirectory(repository);
	const entries = await readdir(base, {withFileTypes: true}).catch(() => []);
	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}
		const directory = join(base, entry.name);
		const info = await stat(directory).catch(() => null);
		if (!info || Date.now() - info.mtimeMs <= STALE_WORKTREE_MS) {
			continue;
		}
		const owner = await readFile(join(directory, 'owner.json'), 'utf8')
			.then((source) => JSON.parse(source) as {pid?: number})
			.catch(() => null);
		if (owner?.pid && isProcessAlive(owner.pid)) {
			continue;
		}
		const checkout = join(directory, 'checkout');
		await runGit(repository.root, [
			'worktree',
			'remove',
			'--force',
			checkout,
		]).catch(() => undefined);
		await rm(directory, {recursive: true, force: true});
	}
};

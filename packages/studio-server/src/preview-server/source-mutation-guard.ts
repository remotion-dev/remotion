import {AsyncLocalStorage} from 'node:async_hooks';
import type {SourceMutationGuard} from '@remotion/studio-shared';
import {getFileWatcherRegistry} from '../file-watcher';
import {resolveFileInsideProject} from '../helpers/resolve-file-inside-project';

const guards = new AsyncLocalStorage<SourceMutationGuard | null>();

export const validateSourceMutation = () => {
	const guard = guards.getStore();
	if (!guard) return;
	const registry = getFileWatcherRegistry();
	for (const [file, revision] of Object.entries(guard.files)) {
		if (
			registry.sourceVersionSessionId !== guard.sessionId ||
			registry.getExternalSourceRevision(file) !== revision
		) {
			throw new Error(
				'The source was edited outside Studio. Pending edits to this file were cancelled.',
			);
		}
	}
};

export const withSourceMutationGuard = <T>(
	guard: SourceMutationGuard | null,
	run: () => T,
): T => guards.run(guard, run);

export const parseSourceMutationGuard = (
	header: string | string[] | undefined,
	remotionRoot: string,
): SourceMutationGuard | null => {
	if (header === undefined) return null;
	if (typeof header !== 'string') throw new Error('Invalid source revision');
	const guard = JSON.parse(header) as SourceMutationGuard;
	if (
		!guard ||
		typeof guard.sessionId !== 'string' ||
		!guard.files ||
		typeof guard.files !== 'object' ||
		Array.isArray(guard.files)
	)
		throw new Error('Invalid source revision');
	const files: Record<string, number> = {};
	for (const [fileName, revision] of Object.entries(guard.files)) {
		if (!Number.isSafeInteger(revision) || revision < 0)
			throw new Error('Invalid source revision');
		const {absolutePath} = resolveFileInsideProject({
			fileName,
			remotionRoot,
			action: 'modify',
		});
		files[absolutePath] = revision;
	}

	return {sessionId: guard.sessionId, files};
};

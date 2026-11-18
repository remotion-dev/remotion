import type {
	SourceFileVersion,
	SourceMutationGuard,
} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import {invalidateOptimisticEffectHistory} from './optimistic-effect-mutations';
import {invalidateOptimisticEffectProps} from './optimistic-effect-props';
import {normalizeSourceFileName} from './rebase-source-request';
import {invalidateSourceFileRemappings} from './sequence-node-path-mutations';

let sessionId: string | null = null;
const revisions = new Map<string, number>();
const listeners = new Set<(file: string) => void>();
export const sourceEditCancelledMessage =
	'The source was edited outside Studio. Pending edits to this file were cancelled.';

export const setExternalSourceSession = (next: string | null) => {
	if (sessionId === next) return;
	sessionId = next;
	revisions.clear();
};

export const captureExternalSourceRevision = (
	files: readonly string[],
): SourceMutationGuard | null =>
	sessionId === null
		? null
		: {
				sessionId,
				files: Object.fromEntries(
					files.map((file) => [
						file,
						revisions.get(normalizeSourceFileName(file, '')) ?? 0,
					]),
				),
			};

export const isCurrentExternalSourceVersion = (
	file: string,
	version: SourceFileVersion,
) =>
	version.sessionId === sessionId &&
	version.revision >= (revisions.get(normalizeSourceFileName(file, '')) ?? 0);

export const subscribeToExternalSourceChanges = (
	listener: (file: string) => void,
) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};

export const recordExternalSourceChange = (
	file: string,
	version: SourceFileVersion,
	resetUndoHistory: boolean,
) => {
	if (version.sessionId !== sessionId) return;
	const normalized = normalizeSourceFileName(file, '');
	if ((revisions.get(normalized) ?? 0) >= version.revision) return;
	revisions.set(normalized, version.revision);
	invalidateSourceFileRemappings(normalized);
	invalidateOptimisticEffectProps(normalized);
	invalidateOptimisticEffectHistory(normalized, resetUndoHistory);
	for (const listener of listeners) listener(normalized);
	for (const entry of Internals.OptimisticEffects.getSnapshot()) {
		if (normalizeSourceFileName(entry.nodePath.absolutePath, '') === normalized)
			Internals.OptimisticEffects.invalidateFile(entry.nodePath.absolutePath);
	}
};

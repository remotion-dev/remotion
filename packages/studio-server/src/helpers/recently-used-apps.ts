import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {defaultCodingAgentIds, defaultEditorIds} from '@remotion/renderer';

const histories = new Map<string, Promise<readonly string[]>>();
const historyListeners = new Set<{
	remotionRoot: string;
	onChange: () => void;
}>();

export const subscribeToRecentlyUsedApps = ({
	remotionRoot,
	onChange,
}: {
	remotionRoot: string;
	onChange: () => void;
}): (() => void) => {
	const listener = {remotionRoot, onChange};
	historyListeners.add(listener);
	return () => {
		historyListeners.delete(listener);
	};
};

export const getRecentlyUsedApps = ({
	remotionRoot,
	type,
	recentlyUsedIds,
}: {
	remotionRoot: string;
	type: 'editor' | 'coding-agent';
	recentlyUsedIds: readonly string[] | null;
}): Promise<readonly string[]> => {
	const filePath = path.join(
		remotionRoot,
		'node_modules',
		'.cache',
		'remotion',
		`recently-used-${type}s.json`,
	);
	const allowedIds: readonly string[] =
		type === 'editor' ? [...defaultEditorIds, 'custom'] : defaultCodingAgentIds;
	const previous =
		histories.get(filePath) ??
		(async () => {
			try {
				const stored: unknown = JSON.parse(await readFile(filePath, 'utf8'));
				return Array.isArray(stored)
					? [
							...new Set(
								stored.filter((id): id is string => allowedIds.includes(id)),
							),
						]
					: [];
			} catch {
				return [];
			}
		})();
	const history = previous.then(async (ids) => {
		if (recentlyUsedIds === null || !Array.isArray(recentlyUsedIds)) {
			return ids;
		}

		const updatedIds = [
			...new Set(recentlyUsedIds.filter((id) => allowedIds.includes(id))),
		];
		if (JSON.stringify(ids) !== JSON.stringify(updatedIds)) {
			try {
				await mkdir(path.dirname(filePath), {recursive: true});
				await writeFile(filePath, JSON.stringify(updatedIds));
			} catch {
				// Keep the history in memory when the project cache is not writable.
			}

			historyListeners.forEach((listener) => {
				if (listener.remotionRoot === remotionRoot) {
					listener.onChange();
				}
			});
		}

		return updatedIds;
	});
	histories.set(filePath, history);
	return history;
};

import type {DefaultCodingAgent} from '@remotion/renderer';
import {
	defaultCodingAgentIds,
	defaultEditorIds,
} from '@remotion/renderer/client';
import type {EditorPickerId} from '@remotion/studio-shared';

export const appSelectedEvent = 'remotion-app-selected';

const createAppHistory = <Id extends string>(
	key: string,
	appIds: readonly Id[],
) => {
	let inMemoryChoices: readonly Id[] | null = null;

	const getRecentlyUsed = (): readonly Id[] => {
		if (inMemoryChoices !== null) {
			return inMemoryChoices;
		}

		try {
			const stored: unknown = JSON.parse(
				window.localStorage.getItem(key) ?? '[]',
			);
			if (Array.isArray(stored)) {
				return stored.filter((id): id is Id => appIds.includes(id));
			}
		} catch {
			// Keep the choice in memory when browser storage is unavailable.
		}

		return [];
	};

	const remember = (appId: Id) => {
		const choices = [appId, ...getRecentlyUsed().filter((id) => id !== appId)];
		try {
			window.localStorage.setItem(key, JSON.stringify(choices));
			inMemoryChoices = null;
		} catch {
			inMemoryChoices = choices;
		}

		window.dispatchEvent(new Event(appSelectedEvent));
	};

	return {getRecentlyUsed, remember};
};

export const codingAgentHistory = createAppHistory<DefaultCodingAgent>(
	'remotion.recentlyUsedCodingAgents',
	defaultCodingAgentIds,
);

export const editorHistory = createAppHistory<EditorPickerId>(
	'remotion.recentlyUsedEditors',
	[...defaultEditorIds, 'custom'],
);

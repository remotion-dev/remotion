import type {DefaultCodingAgent} from '@remotion/renderer';
import {defaultCodingAgentIds} from '@remotion/renderer/client';

const key = 'remotion.recentlyUsedCodingAgents';
export const codingAgentSelectedEvent = 'remotion-coding-agent-selected';
let inMemoryChoices: readonly DefaultCodingAgent[] | null = null;

export const getRecentlyUsedCodingAgents =
	(): readonly DefaultCodingAgent[] => {
		if (inMemoryChoices !== null) {
			return inMemoryChoices;
		}

		try {
			const stored: unknown = JSON.parse(
				window.localStorage.getItem(key) ?? '[]',
			);
			if (Array.isArray(stored)) {
				return stored.filter((id): id is DefaultCodingAgent =>
					defaultCodingAgentIds.includes(id),
				);
			}
		} catch {
			// Keep the choice in memory when browser storage is unavailable.
		}

		return [];
	};

export const rememberCodingAgent = (codingAgentId: DefaultCodingAgent) => {
	const choices = [
		codingAgentId,
		...getRecentlyUsedCodingAgents().filter((id) => id !== codingAgentId),
	];
	try {
		window.localStorage.setItem(key, JSON.stringify(choices));
		inMemoryChoices = null;
	} catch {
		inMemoryChoices = choices;
	}

	window.dispatchEvent(new Event(codingAgentSelectedEvent));
};

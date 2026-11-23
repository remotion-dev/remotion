import type {SettingsTab} from '../helpers/settings-tab-availability';

export type SettingsSearchResult = {
	readonly id: string;
	readonly tab: SettingsTab;
	readonly name: string;
	readonly description: string;
	readonly category: string;
	readonly keywords: string;
};

export type SettingsSearchTarget = {
	readonly id: string;
	readonly tab: SettingsTab;
	readonly focusControl: boolean;
};

export const searchSettings = (
	entries: readonly SettingsSearchResult[],
	query: string,
) => {
	const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	if (words.length === 0) {
		return [];
	}

	return entries
		.filter((entry) => {
			const text =
				`${entry.name} ${entry.description} ${entry.category} ${entry.keywords}`.toLowerCase();
			return words.every((word) => text.includes(word));
		})
		.sort((a, b) => {
			const aName = a.name.toLowerCase();
			const bName = b.name.toLowerCase();
			const normalizedQuery = words.join(' ');
			const rank = (name: string) =>
				name === normalizedQuery ? 0 : name.startsWith(normalizedQuery) ? 1 : 2;
			return rank(aName) - rank(bName);
		});
};

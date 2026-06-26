import type {EffectCatalogItem} from '@remotion/studio-shared';

const normalize = (value: string) => value.trim().toLowerCase();

const compact = (value: string) => normalize(value).replace(/[^a-z0-9]/g, '');

const fuzzyMatches = (query: string, value: string) => {
	let index = -1;
	for (const character of query) {
		index = value.indexOf(character, index + 1);
		if (index === -1) {
			return false;
		}
	}

	return true;
};

const getMatchScore = (item: EffectCatalogItem, query: string) => {
	const normalizedQuery = normalize(query);
	const compactQuery = compact(query);

	if (normalizedQuery.length === 0) {
		return 0;
	}

	const label = normalize(item.label);
	const name = normalize(item.effect.name);
	const primary = [label, name];
	const compactPrimary = primary.map(compact);

	if (primary.some((field) => field === normalizedQuery)) {
		return 0;
	}

	if (compactQuery.length > 0) {
		if (compactPrimary.some((field) => field === compactQuery)) {
			return 1;
		}

		if (compactPrimary.some((field) => field.startsWith(compactQuery))) {
			return 2;
		}
	}

	if (primary.some((field) => field.startsWith(normalizedQuery))) {
		return 2;
	}

	if (compactQuery.length > 0) {
		if (compactPrimary.some((field) => field.includes(compactQuery))) {
			return 3;
		}
	}

	if (primary.some((field) => field.includes(normalizedQuery))) {
		return 3;
	}

	const importPath = normalize(item.effect.importPath);
	if (
		importPath.includes(normalizedQuery) ||
		(compactQuery.length > 0 && compact(importPath).includes(compactQuery))
	) {
		return 4;
	}

	const secondary = [normalize(item.category), normalize(item.description)];
	const compactSecondary = secondary.map(compact);
	if (
		secondary.some((field) => field.includes(normalizedQuery)) ||
		(compactQuery.length > 0 &&
			compactSecondary.some((field) => field.includes(compactQuery)))
	) {
		return 5;
	}

	if (
		compactQuery.length > 0 &&
		compactPrimary.some((field) => fuzzyMatches(compactQuery, field))
	) {
		return 6;
	}

	return null;
};

export const filterEffectCatalog = ({
	items,
	query,
}: {
	readonly items: readonly EffectCatalogItem[];
	readonly query: string;
}) => {
	return items
		.map((item, index) => ({
			item,
			index,
			score: getMatchScore(item, query),
		}))
		.filter(
			(
				candidate,
			): candidate is {
				readonly item: EffectCatalogItem;
				readonly index: number;
				readonly score: number;
			} => candidate.score !== null,
		)
		.sort((a, b) => a.score - b.score || a.index - b.index)
		.map(({item}) => item);
};

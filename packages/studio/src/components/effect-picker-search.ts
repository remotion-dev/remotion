import type {EffectCatalogItem} from '@remotion/studio-shared';

const reservedModuleBindings = new Set([
	'arguments',
	'await',
	'break',
	'case',
	'catch',
	'class',
	'const',
	'continue',
	'debugger',
	'default',
	'delete',
	'do',
	'else',
	'enum',
	'eval',
	'export',
	'extends',
	'false',
	'finally',
	'for',
	'function',
	'if',
	'implements',
	'import',
	'in',
	'instanceof',
	'interface',
	'let',
	'new',
	'null',
	'package',
	'private',
	'protected',
	'public',
	'return',
	'static',
	'super',
	'switch',
	'this',
	'throw',
	'true',
	'try',
	'typeof',
	'var',
	'void',
	'while',
	'with',
	'yield',
]);

export const getCreateEffectResult = (query: string) => {
	const words =
		query
			.normalize('NFC')
			.replace(/([\p{Ll}\p{Nd}])(\p{Lu})/gu, '$1 $2')
			.replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
			.toLowerCase()
			.match(/[\p{L}\p{Nd}][\p{L}\p{M}\p{Nd}]*/gu) ?? [];
	const camelCase = words
		.map((word, index) =>
			index === 0 ? word : word.replace(/^./u, (first) => first.toUpperCase()),
		)
		.join('');
	const candidate = /^\p{Nd}/u.test(camelCase)
		? `effect${camelCase}`
		: camelCase;
	const name = reservedModuleBindings.has(candidate)
		? `${candidate}Effect`
		: /^\p{ID_Start}\p{ID_Continue}*$/u.test(candidate)
			? candidate
			: null;

	return {
		id: 'create-effect',
		effect: null,
		query: query.trim(),
		name,
		label: name ? `Create ${name}()` : 'Create new...',
		description: name
			? `You can generate a custom ${name}() effect and apply it to this element using an agent.`
			: 'You can make a custom effect by describing it to an agent.',
	} as const;
};

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

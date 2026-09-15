import {
	en,
	messages,
	type Locale,
	type MessageCatalog,
	type MessageKey,
} from './messages';

export type MessageValues = Record<
	string,
	string | number | boolean | null | undefined
>;

export type MessageCatalogs = Partial<Record<Locale, MessageCatalog>>;

const PLACEHOLDER_PATTERN = /\{([a-zA-Z0-9_.-]+)\}/g;

const getPlaceholders = (message: string): string[] => {
	return Array.from(
		message.matchAll(PLACEHOLDER_PATTERN),
		(match) => match[1],
	).sort();
};

const hasMatchingPlaceholders = (
	source: string,
	translated: string,
): boolean => {
	return (
		JSON.stringify(getPlaceholders(source)) ===
		JSON.stringify(getPlaceholders(translated))
	);
};

export const formatMessage = (
	message: string,
	values: MessageValues = {},
): string => {
	return message.replace(PLACEHOLDER_PATTERN, (placeholder, key: string) => {
		const value = values[key];
		return value === undefined || value === null ? placeholder : String(value);
	});
};

export const getMissingMessageKeys = (locale: Locale): MessageKey[] => {
	const catalog = messages[locale];
	return (Object.keys(en) as MessageKey[]).filter(
		(key) => typeof catalog[key] !== 'string' || catalog[key].trim() === '',
	);
};

export const getCatalogIssues = (locale: Locale): string[] => {
	const catalog = messages[locale] as MessageCatalog;
	const issues: string[] = [];

	for (const key of getMissingMessageKeys(locale)) {
		issues.push(`${locale}:${key}:missing`);
	}

	for (const [key, value] of Object.entries(catalog)) {
		if (!(key in en)) {
			issues.push(`${locale}:${key}:unknown-key`);
			continue;
		}

		if (typeof value !== 'string' || value.trim() === '') {
			continue;
		}

		if (!hasMatchingPlaceholders(en[key as MessageKey], value)) {
			issues.push(`${locale}:${key}:placeholder-mismatch`);
		}
	}

	return issues;
};

export const createTranslator = (
	locale: Locale,
	catalogs: MessageCatalogs = messages,
) => {
	const catalog = catalogs[locale] ?? {};

	return (key: MessageKey, values?: MessageValues): string => {
		const fallback = en[key];
		const translated = catalog[key];
		const template =
			typeof translated === 'string' &&
			translated.trim() !== '' &&
			hasMatchingPlaceholders(fallback, translated)
				? translated
				: fallback;

		return formatMessage(template, values);
	};
};

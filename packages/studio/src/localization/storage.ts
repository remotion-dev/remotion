import {SUPPORTED_LOCALES, type Locale} from './messages';

export const STUDIO_LOCALE_STORAGE_KEY = 'remotion.studio.locale';

type LocaleStorage = Pick<Storage, 'getItem' | 'setItem'>;

const getBrowserStorage = (): LocaleStorage | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		return window.localStorage;
	} catch {
		return null;
	}
};

export const isSupportedLocale = (value: unknown): value is Locale => {
	return (
		typeof value === 'string' &&
		(SUPPORTED_LOCALES as readonly string[]).includes(value)
	);
};

export const loadLocale = (
	storage: LocaleStorage | null = getBrowserStorage(),
): Locale => {
	if (storage === null) {
		return 'en';
	}

	try {
		const value = storage.getItem(STUDIO_LOCALE_STORAGE_KEY);
		return isSupportedLocale(value) ? value : 'en';
	} catch {
		return 'en';
	}
};

export const saveLocale = (
	locale: Locale,
	storage: LocaleStorage | null = getBrowserStorage(),
): void => {
	if (storage === null) {
		return;
	}

	try {
		storage.setItem(STUDIO_LOCALE_STORAGE_KEY, locale);
	} catch {
		// Private browsing and disabled storage must not break the Studio.
	}
};

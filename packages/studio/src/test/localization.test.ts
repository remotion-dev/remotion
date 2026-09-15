import {expect, test} from 'bun:test';
import {SUPPORTED_LOCALES, type Locale} from '../localization/messages';
import {
	loadLocale,
	saveLocale,
	STUDIO_LOCALE_STORAGE_KEY,
} from '../localization/storage';
import {
	createTranslator,
	getCatalogIssues,
	getMissingMessageKeys,
} from '../localization/translate';

test('translates the stable message key for the selected locale', () => {
	expect(createTranslator('en')('settings.title')).toBe('Settings');
	expect(createTranslator('ja')('settings.title')).toBe('設定');
	expect(createTranslator('ja')('menus.file')).toBe('ファイル');
	expect(createTranslator('ja')('menus.renderInBrowser')).toBe(
		'ブラウザでレンダー…',
	);
});

test('falls back to English when a locale has no translation', () => {
	const translate = createTranslator('ja', {
		ja: {'settings.title': '設定'},
	});

	expect(translate('settings.language')).toBe('Language');
});

test('falls back to English when a translation changes placeholders', () => {
	const translate = createTranslator('ja', {
		ja: {'settings.language': '{wrong}'},
	});

	expect(translate('settings.language', {locale: '日本語'})).toBe('Language');
	expect(createTranslator('en')('settings.selected', {locale: 'English'})).toBe(
		'Language: English',
	);
});

test('keeps the Japanese catalog complete and placeholder-compatible', () => {
	expect(getMissingMessageKeys('ja')).toEqual([]);
	expect(getCatalogIssues('ja')).toEqual([]);
	expect(getMissingMessageKeys('en')).toEqual([]);
	expect(getCatalogIssues('en')).toEqual([]);
});

test('loads only supported persisted locales and defaults to English', () => {
	const storage = new Map<string, string>();
	const storageLike = {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
	};

	expect(loadLocale(storageLike)).toBe('en');
	storage.set(STUDIO_LOCALE_STORAGE_KEY, 'ja');
	expect(loadLocale(storageLike)).toBe('ja');
	storage.set(STUDIO_LOCALE_STORAGE_KEY, 'fr');
	expect(loadLocale(storageLike)).toBe('en');

	saveLocale('ja', storageLike);
	expect(storage.get(STUDIO_LOCALE_STORAGE_KEY)).toBe('ja');
});

test('keeps the locale list explicit for future additions', () => {
	expect(SUPPORTED_LOCALES).toEqual(['en', 'ja']);
	const locales: Locale[] = [...SUPPORTED_LOCALES];
	expect(locales).toContain('ja');
});

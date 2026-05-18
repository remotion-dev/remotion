import {afterEach, beforeEach, expect, test} from 'bun:test';
import {
	loadPersistedBooleanMap,
	onlyExpandedBooleanMapValues,
	persistBooleanMap,
	toggleBooleanMapKey,
} from '../helpers/persist-boolean-map';

const sessionKey = 'test.session.boolean-map';
const legacyKey = 'test.local.boolean-map';

const createStorage = () => {
	const map = new Map<string, string>();

	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => {
			map.set(key, value);
		},
		removeItem: (key: string) => {
			map.delete(key);
		},
	};
};

beforeEach(() => {
	globalThis.window = {
		sessionStorage: createStorage(),
		localStorage: createStorage(),
	} as Window & typeof globalThis;
});

afterEach(() => {
	Reflect.deleteProperty(globalThis, 'window');
});

test('onlyExpandedBooleanMapValues keeps only true entries', () => {
	expect(
		onlyExpandedBooleanMapValues({
			a: true,
			b: false,
			c: true,
		}),
	).toEqual({
		a: true,
		c: true,
	});
});

test('toggleBooleanMapKey removes key when collapsing', () => {
	expect(toggleBooleanMapKey({a: true}, 'a')).toEqual({});
	expect(toggleBooleanMapKey({}, 'a')).toEqual({a: true});
});

test('persistBooleanMap stores only expanded keys in sessionStorage', () => {
	persistBooleanMap(sessionKey, {
		expanded: true,
		collapsed: false,
	});

	expect(window.sessionStorage.getItem(sessionKey)).toBe(
		JSON.stringify({expanded: true}),
	);
});

test('loadPersistedBooleanMap migrates from localStorage once', () => {
	window.localStorage.setItem(
		legacyKey,
		JSON.stringify({fromLegacy: true, collapsed: false}),
	);

	expect(
		loadPersistedBooleanMap({
			sessionStorageKey: sessionKey,
			legacyLocalStorageKey: legacyKey,
		}),
	).toEqual({fromLegacy: true});

	expect(window.localStorage.getItem(legacyKey)).toBeNull();
	expect(window.sessionStorage.getItem(sessionKey)).toBe(
		JSON.stringify({fromLegacy: true}),
	);
});

import {expect, test} from 'bun:test';
import {validateSiteName} from '../shared/validate-site-name';

test('allows valid site names', () => {
	expect(() => validateSiteName('my-site')).not.toThrow();
	expect(() => validateSiteName('my_site.v1')).not.toThrow();
	expect(() => validateSiteName("my-site-!'()*")).not.toThrow();
});

test('rejects invalid characters', () => {
	expect(() => validateSiteName('my site')).toThrow(/Check for invalid characters/);
	expect(() => validateSiteName('my@site')).toThrow(/Check for invalid characters/);
	expect(() => validateSiteName('my#site')).toThrow(/Check for invalid characters/);
});

test('rejects dot segments and empty strings', () => {
	expect(() => validateSiteName('.')).toThrow(/Check for invalid characters/);
	expect(() => validateSiteName('..')).toThrow(/Check for invalid characters/);
	expect(() => validateSiteName('')).toThrow(/Check for invalid characters/);
});

test('rejects substrings and suffixes that contain invalid characters', () => {
	expect(() => validateSiteName('valid/name')).toThrow(/Check for invalid characters/);
	expect(() => validateSiteName('valid name')).toThrow(/Check for invalid characters/);
});

test('allows undefined', () => {
	expect(() => validateSiteName(undefined)).not.toThrow();
});

test('throws a TypeError for non-string types', () => {
	expect(() => validateSiteName(123)).toThrow(TypeError);
	expect(() => validateSiteName(null)).toThrow(TypeError);
});

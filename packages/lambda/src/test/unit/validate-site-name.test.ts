import {expect, test} from 'bun:test';
import {validateSiteName} from '../../shared/validate-site-name';

test('allows valid site names', () => {
	expect(() => validateSiteName('mysite')).not.toThrow();
	expect(() => validateSiteName('my-site_1.0')).not.toThrow();
	expect(() => validateSiteName("it's-fine!")).not.toThrow();
	expect(() => validateSiteName('a(b)c')).not.toThrow();
	expect(() => validateSiteName('0.1.2')).not.toThrow();
});

test('rejects invalid characters', () => {
	expect(() => validateSiteName('my@site')).toThrow();
	expect(() => validateSiteName('a#b')).toThrow();
	expect(() => validateSiteName('site name')).toThrow();
	expect(() => validateSiteName('site/name')).toThrow();
	expect(() => validateSiteName('site\\name')).toThrow();
	expect(() => validateSiteName('site:name')).toThrow();
});

test('rejects dot segments and empty strings', () => {
	expect(() => validateSiteName('.')).toThrow();
	expect(() => validateSiteName('..')).toThrow();
	expect(() => validateSiteName('')).toThrow();
});

test('rejects Unicode characters outside the allowlist', () => {
	expect(() => validateSiteName('süte')).toThrow();
	expect(() => validateSiteName('site\u00e9')).toThrow();
});

test('rejects substrings and suffixes that contain invalid characters', () => {
	expect(() => validateSiteName('good/bad')).toThrow();
	expect(() => validateSiteName('bad good')).toThrow();
	expect(() => validateSiteName('prefix@suffix')).toThrow();
});

test('allows undefined', () => {
	expect(() => validateSiteName(undefined)).not.toThrow();
});

test('throws a TypeError for non-string types', () => {
	expect(() => validateSiteName(123)).toThrow(TypeError);
	expect(() => validateSiteName(null)).toThrow(TypeError);
	expect(() => validateSiteName({})).toThrow(TypeError);
});

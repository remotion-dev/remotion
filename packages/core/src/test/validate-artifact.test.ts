import {expect, test} from 'bun:test';
import {validateArtifactFilename} from '../validation/validate-artifact';

test('accepts nested artifact filenames', () => {
	expect(() =>
		validateArtifactFilename('captions/this-week.srt'),
	).not.toThrow();
});

test('rejects parent directory segments', () => {
	expect(() => validateArtifactFilename('../escape.txt')).toThrow();
	expect(() => validateArtifactFilename('../../../escape.txt')).toThrow();
	expect(() => validateArtifactFilename('captions/../../escape.txt')).toThrow();
});

test('accepts folder names that merely contain dots', () => {
	expect(() => validateArtifactFilename('my..folder/file.txt')).not.toThrow();
});

test('rejects Windows separator traversal', () => {
	expect(() => validateArtifactFilename('..\\escape.txt')).toThrow();
	expect(() => validateArtifactFilename('..\\..\\escape.txt')).toThrow();
	expect(() =>
		validateArtifactFilename('captions/..\\..\\escape.txt'),
	).toThrow();
});

test('rejects characters after an otherwise valid prefix', () => {
	expect(() => validateArtifactFilename('ok.txt#')).toThrow();
});

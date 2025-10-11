import {expect, test} from 'bun:test';
import {serializeThenDeserialize} from '../input-props-serialization.js';
import {staticFile} from '../static-file.js';

test('staticFile() should convert # into %23', () => {
	const unsafeName = 'test/example#music';
	expect(staticFile(unsafeName)).toBe('/static-abcdef/test/example%23music');
});

test('staticFile() passing already encoded path should give warning', () => {
	const unsafeName = '/test%2Fexample%23music';
	expect(staticFile(unsafeName)).toBe(
		'/static-abcdef/test%252Fexample%2523music',
	);
});

test('staticFile() should not encode slashes', () => {
	const nameWithSlashes = '/test/example/word';
	expect(staticFile(nameWithSlashes)).toBe(`/static-abcdef${nameWithSlashes}`);
});

test('staticFile() should encode all problematic characters except slashes', () => {
	const nameWithSlashes = '/test/#example/$word';
	expect(staticFile(nameWithSlashes)).toBe(
		'/static-abcdef/test/%23example/%24word',
	);
});

test('if no leading slash exists, one should be added', () => {
	const nameWithSlashes = 'test/example';
	expect(staticFile(nameWithSlashes)).toBe('/static-abcdef/test/example');
});

test('problematic character at the beginning should be encoded correctly', () => {
	const problematicStart = '#test/example';
	expect(staticFile(problematicStart)).toBe('/static-abcdef/%23test/example');
});

test('should handle this properly', () => {
	expect(
		staticFile('mediaparsernextsteps/Screenshot 2025-01-31 at 08.13.54.png'),
	).toBe(
		'/static-abcdef/mediaparsernextsteps/Screenshot%202025-01-31%20at%2008.13.54.png',
	);
});

test('should keep spaces', () => {
	const hi = serializeThenDeserialize({
		file: staticFile(
			'mediaparsernextsteps/Screenshot 2025-01-31 at 08.13.54.png',
		),
	});
	expect(hi.file).toBe(
		'/static-abcdef/mediaparsernextsteps/Screenshot%202025-01-31%20at%2008.13.54.png',
	);
});

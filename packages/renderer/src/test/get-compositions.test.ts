import {expect, test} from 'bun:test';
import {convertGetCompositionsArgumentsToOptions} from '../get-compositions';

test('Should gate the legacy positional getCompositions() signature', () => {
	expect(
		convertGetCompositionsArgumentsToOptions(
			['https://example.com', {inputProps: {title: 'Hello'}}],
			false,
		),
	).toEqual({
		serveUrl: 'https://example.com',
		inputProps: {title: 'Hello'},
	});

	expect(() =>
		convertGetCompositionsArgumentsToOptions(['https://example.com'], true),
	).toThrow(
		'getCompositions() no longer supports the legacy positional arguments. Pass an options object instead: getCompositions({serveUrl, ...options}).',
	);
});

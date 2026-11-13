import {expect, test} from 'bun:test';
import {metadataOption} from '../options/metadata';

test('--metadata keeps "=" signs that are part of the value', () => {
	expect(
		metadataOption.getValue({
			commandLine: {
				metadata: [
					'comment=a=b',
					'description=https://example.com/watch?v=abc',
				],
			},
		}).value,
	).toEqual({
		comment: 'a=b',
		description: 'https://example.com/watch?v=abc',
	});
});

import {expect, test} from 'bun:test';
import {parsePullfrogAssessment} from '../classification-parse';

test('parses a clean Pullfrog assessment', () => {
	expect(
		parsePullfrogAssessment(
			'{"classification":"clean","summary":"No action is required."}',
		),
	).toEqual({classification: 'clean', summary: 'No action is required.'});
});

test('rejects an invalid Pullfrog assessment', () => {
	expect(() =>
		parsePullfrogAssessment(
			'{"classification":"approved","summary":"Looks good."}',
		),
	).toThrow('invalid classification');
});

import {expect, test} from 'bun:test';
import {parseCaptionFile} from '../components/parse-caption-file';

const parseJson = (value: unknown) => {
	return parseCaptionFile({
		fileName: 'captions.json',
		contents: JSON.stringify(value),
	});
};

test('imports Remotion Caption[] JSON', () => {
	expect(
		parseJson([
			{
				text: 'Hello',
				startMs: 0,
				endMs: 500,
				timestampMs: 250,
				confidence: null,
				pageBreakAfter: true,
			},
		]),
	).toEqual([
		{
			text: 'Hello',
			startMs: 0,
			endMs: 500,
			timestampMs: 250,
			confidence: null,
			pageBreakAfter: true,
		},
	]);
});

test.each([
	{
		name: 'non-JSON input',
		value: '{',
		error: 'Invalid JSON:',
	},
	{
		name: 'non-array JSON',
		value: '{}',
		error: 'Expected a Remotion Caption[] JSON array',
	},
	{
		name: 'missing field',
		value: JSON.stringify([
			{text: 'Hello', endMs: 500, timestampMs: 250, confidence: null},
		]),
		error: 'captions[0].startMs must be a finite, non-negative number',
	},
	{
		name: 'reversed timing',
		value: JSON.stringify([
			{
				text: 'Hello',
				startMs: 500,
				endMs: 0,
				timestampMs: 250,
				confidence: null,
			},
		]),
		error: 'captions[0].endMs must not be earlier than startMs',
	},
	{
		name: 'invalid confidence',
		value: JSON.stringify([
			{
				text: 'Hello',
				startMs: 0,
				endMs: 500,
				timestampMs: 250,
				confidence: 2,
			},
		]),
		error: 'captions[0].confidence must be between 0 and 1',
	},
])('rejects $name', ({value, error}) => {
	expect(() =>
		parseCaptionFile({fileName: 'captions.json', contents: value}),
	).toThrow(error);
});

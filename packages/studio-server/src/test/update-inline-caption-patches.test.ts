import {expect, test} from 'bun:test';
import {updateInlineCaptionPatches} from '../codemods/update-inline-caption-patches';
import {lineColumnToNodePath} from './test-utils';

const input = `import {TimedCaptions} from './TimedCaptions';

export const Example = () => {
	return (
		<TimedCaptions
			captions={[
				{
					text: 'First',
					startMs: 0,
					endMs: 1000,
					timestampMs: 500,
					confidence: null,
				},
				{
					text: 'Second',
					startMs: 1000,
					endMs: 2000,
					timestampMs: 1500,
					confidence: 0.9,
				},
			]}
		/>
	);
};
`;

test('updates only the patched inline caption fields', () => {
	const {output, changedFields} = updateInlineCaptionPatches({
		input,
		nodePath: lineColumnToNodePath(input, 5),
		patches: [
			{
				index: 1,
				// The browser preserves the source object's property insertion order.
				before: {
					confidence: 0.9,
					startMs: 1000,
					endMs: 2000,
					text: 'Second',
					timestampMs: 1500,
					pageBreakAfter: null,
				},
				changes: {startMs: 1100, endMs: 2100},
			},
		],
	});

	expect(changedFields).toEqual([['startMs', 'endMs']]);
	expect(output).toBe(
		input.replace(
			"text: 'Second',\n\t\t\t\t\tstartMs: 1000,\n\t\t\t\t\tendMs: 2000,",
			"text: 'Second',\n\t\t\t\t\tstartMs: 1100,\n\t\t\t\t\tendMs: 2100,",
		),
	);
});

test('adds and updates pageBreakAfter on inline captions', () => {
	const added = updateInlineCaptionPatches({
		input,
		nodePath: lineColumnToNodePath(input, 5),
		patches: [
			{
				index: 0,
				before: {
					text: 'First',
					startMs: 0,
					endMs: 1000,
					timestampMs: 500,
					confidence: null,
					pageBreakAfter: null,
				},
				changes: {pageBreakAfter: true},
			},
		],
	});

	expect(added.changedFields).toEqual([['pageBreakAfter']]);
	expect(added.output).toContain(
		'\t\t\t\t\tconfidence: null,\n\t\t\t\t\tpageBreakAfter: true,',
	);

	const updated = updateInlineCaptionPatches({
		input: added.output,
		nodePath: lineColumnToNodePath(added.output, 5),
		patches: [
			{
				index: 0,
				before: {
					text: 'First',
					startMs: 0,
					endMs: 1000,
					timestampMs: 500,
					confidence: null,
					pageBreakAfter: true,
				},
				changes: {pageBreakAfter: false},
			},
		],
	});

	expect(updated.output).toContain('pageBreakAfter: false,');
});

test('adds pageBreakAfter to a single-line inline caption', () => {
	const singleLineInput = `export const Example = () => {
	return <TimedCaptions captions={[{text: 'First', startMs: 0, endMs: 1000, timestampMs: 500, confidence: null}]} />;
};
`;
	const {output} = updateInlineCaptionPatches({
		input: singleLineInput,
		nodePath: lineColumnToNodePath(singleLineInput, 2),
		patches: [
			{
				index: 0,
				before: {
					text: 'First',
					startMs: 0,
					endMs: 1000,
					timestampMs: 500,
					confidence: null,
					pageBreakAfter: null,
				},
				changes: {pageBreakAfter: true},
			},
		],
	});

	expect(output).toContain('confidence: null, pageBreakAfter: true}]}');
});

test('rejects a queued patch whose source caption has changed', () => {
	expect(() =>
		updateInlineCaptionPatches({
			input,
			nodePath: lineColumnToNodePath(input, 5),
			patches: [
				{
					index: 0,
					before: {
						text: 'Different',
						startMs: 0,
						endMs: 1000,
						timestampMs: 500,
						confidence: null,
						pageBreakAfter: null,
					},
					changes: {endMs: 900},
				},
			],
		}),
	).toThrow('Caption 0 changed in the source file');
});

test('rejects captions wrapped in a satisfies expression', () => {
	const captionsWithSatisfies = input.replace(
		'\t\t\t]}',
		'\t\t\t] satisfies Caption[]}',
	);

	expect(() =>
		updateInlineCaptionPatches({
			input: captionsWithSatisfies,
			nodePath: lineColumnToNodePath(captionsWithSatisfies, 5),
			patches: [
				{
					index: 0,
					before: {
						text: 'First',
						startMs: 0,
						endMs: 1000,
						timestampMs: 500,
						confidence: null,
						pageBreakAfter: null,
					},
					changes: {text: 'Updated'},
				},
			],
		}),
	).toThrow('Captions must be an inline JSX array');
});

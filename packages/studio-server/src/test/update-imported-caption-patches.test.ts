import {expect, test} from 'bun:test';
import {updateImportedCaptionPatches} from '../codemods/update-imported-caption-patches';

const input = `import type {Caption} from '@remotion/captions';

export const captions = [
	{
		text: 'First',
		startMs: 0,
		endMs: 1000,
		timestampMs: 500,
		confidence: null,
	},
] satisfies Caption[];
`;

test('updates an exported static caption declaration', () => {
	const {output, changedFields} = updateImportedCaptionPatches({
		input,
		exportName: 'captions',
		patches: [
			{
				index: 0,
				before: {
					confidence: null,
					startMs: 0,
					endMs: 1000,
					text: 'First',
					timestampMs: 500,
				},
				changes: {text: 'Updated'},
			},
		],
	});

	expect(changedFields).toEqual([['text']]);
	expect(output).toBe(input.replace("text: 'First'", "text: 'Updated'"));
});

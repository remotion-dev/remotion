import {expect, test} from 'bun:test';
import type {InteractivitySchema} from 'remotion';
import {
	convertSequencePropEditToCodemodChange,
	shouldSuppressHmrForSequencePropEdits,
} from '../preview-server/routes/save-sequence-props';

const starSchema = {
	points: {
		type: 'number',
		default: 5,
		description: 'Points',
		hiddenFromList: false,
	},
} satisfies InteractivitySchema;

test('saveSequenceProps suppresses HMR for regular visual prop edits', () => {
	expect(
		shouldSuppressHmrForSequencePropEdits([
			{key: 'style.translate'},
			{key: 'hidden'},
		]),
	).toBe(true);
});

test('saveSequenceProps does not suppress HMR for showInTimeline edits', () => {
	expect(
		shouldSuppressHmrForSequencePropEdits([
			{key: 'style.translate'},
			{key: 'showInTimeline'},
		]),
	).toBe(false);
});

test('saveSequenceProps does not suppress HMR for Google Font source edits', () => {
	expect(
		shouldSuppressHmrForSequencePropEdits([
			{
				key: 'style.fontFamily',
				sourceEdit: {
					type: 'google-font',
					font: {
						fontFamily: 'Roboto',
						importName: 'Roboto',
						style: 'normal',
						weights: ['400', '700', '800'],
						subsets: ['latin'],
					},
				},
			},
		]),
	).toBe(false);
});

test('saveSequenceProps forwards element schemas to the codemod', () => {
	const change = convertSequencePropEditToCodemodChange({
		nodePath: {
			absolutePath: '/tmp/Composition.tsx',
			nodePath: ['program', 'body', 0],
			sequenceKeys: [],
			effectKeys: [],
		},
		key: 'points',
		value: 7,
		defaultValue: 5,
		schema: starSchema,
		sourceEdit: null,
	});

	expect(change).toEqual({
		nodePath: ['program', 'body', 0],
		updates: [
			{
				key: 'points',
				value: 7,
				defaultValue: 5,
				googleFont: null,
			},
		],
		schema: starSchema,
	});
});

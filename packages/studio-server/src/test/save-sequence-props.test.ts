import {expect, test} from 'bun:test';
import {shouldSuppressHmrForSequencePropEdits} from '../preview-server/routes/save-sequence-props';

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

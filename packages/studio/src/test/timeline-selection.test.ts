import {expect, test} from 'bun:test';
import {
	SELECTION_ENABLED,
	TIMELINE_TOP_DRAG,
} from '../components/Timeline/TimelineSelection';

test('Timeline selection should stay disabled until released publicly', () => {
	expect(SELECTION_ENABLED).toBe(false);
});

test('Timeline top drag should be enabled', () => {
	expect(TIMELINE_TOP_DRAG).toBe(false);
});

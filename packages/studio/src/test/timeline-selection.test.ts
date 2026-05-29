import {expect, test} from 'bun:test';
import {SELECTION_ENABLED} from '../components/Timeline/TimelineSelection';

test('Timeline selection should stay disabled until released publicly', () => {
	expect(SELECTION_ENABLED).toBe(false);
});

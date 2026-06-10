import {expect, test} from 'bun:test';
import {CANVAS_CAPTURE_TARGET} from '../components/canvas-capture-enabled';

test('Canvas capture should be disabled by default', () => {
	expect(CANVAS_CAPTURE_TARGET).toBe('off');
});

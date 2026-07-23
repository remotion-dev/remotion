import {expect, test} from 'bun:test';
import {CANVAS_CAPTURE_ENABLED} from '../components/canvas-capture-enabled';

test('Canvas capture should be disabled by default', () => {
	expect(CANVAS_CAPTURE_ENABLED).toBe(false);
});

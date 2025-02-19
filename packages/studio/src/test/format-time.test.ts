import {expect, test} from 'bun:test';
import {renderFrame} from '../state/render-frame';

test('Format time', () => {
	expect(renderFrame(152, 30)).toBe('00:05.02');
	expect(renderFrame(300, 30)).toBe('00:10.00');
	expect(renderFrame(30000, 30)).toBe('16:40.00');
	expect(renderFrame(300000, 30)).toBe('2:46:40.00');
});

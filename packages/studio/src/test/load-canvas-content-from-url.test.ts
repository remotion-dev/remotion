import {expect, test} from 'bun:test';
import {deriveCanvasContentFromRoute} from '../components/load-canvas-content-from-url';

test('does not derive an asset from the assets root route', () => {
	expect(deriveCanvasContentFromRoute('/assets')).toBe(null);
	expect(deriveCanvasContentFromRoute('/assets/')).toBe(null);
});

test('derives an asset route', () => {
	expect(
		deriveCanvasContentFromRoute('/assets/folder%20name/image.png'),
	).toEqual({
		type: 'asset',
		asset: 'folder name/image.png',
	});
});

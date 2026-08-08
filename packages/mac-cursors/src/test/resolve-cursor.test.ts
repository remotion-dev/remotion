import {expect, test} from 'bun:test';
import {resolveCursor} from '../resolve-cursor';

test('resolves named, custom, hidden, and unknown cursors', () => {
	const pointer = resolveCursor('pointer');
	expect(pointer?.src).toStartWith('data:image/svg+xml;base64,');
	expect(pointer?.hotspot).toEqual({x: 14, y: 8});
	expect(pointer?.width).toBe(32);

	const custom = resolveCursor(
		'url(data:image/svg+xml;base64,PHN2Zy8+) 6.5 7, pointer',
	);
	expect(custom).toEqual({
		src: 'data:image/svg+xml;base64,PHN2Zy8+',
		hotspot: {x: 6.5, y: 7},
		width: null,
		height: null,
	});

	expect(resolveCursor('none')).toBeNull();
	expect(resolveCursor('not-a-real-cursor')?.hotspot).toEqual({x: 10, y: 9});
});

import {expect, test} from 'bun:test';
import {macOSCursorSchema} from '../MacOSCursor';
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

	const customWithDimensions = `data:image/svg+xml,${encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="18"/>',
	)}`;
	expect(resolveCursor(`url("${customWithDimensions}") 6 7, pointer`)).toEqual({
		src: customWithDimensions,
		hotspot: {x: 6, y: 7},
		width: 24,
		height: 18,
	});

	const base64WithDimensions = `data:image/svg+xml;base64,${btoa(
		'<svg width="64" height="48px"/>',
	)}`;
	expect(resolveCursor(`url(${base64WithDimensions}), auto`)).toEqual({
		src: base64WithDimensions,
		hotspot: {x: 0, y: 0},
		width: 64,
		height: 48,
	});

	expect(resolveCursor('none')).toBeNull();
	expect(resolveCursor('not-a-real-cursor')?.hotspot).toEqual({x: 10, y: 9});
});

test('cursor schema exposes named cursors as a keyframable enum', () => {
	const cursorSchema = macOSCursorSchema.cursor;
	if (cursorSchema.type !== 'enum') {
		throw new Error('Expected cursor schema to be an enum');
	}

	expect(cursorSchema.keyframable).toBe(true);
	expect(cursorSchema.variants.default).toEqual({});
	expect(cursorSchema.variants['ne-resize']).toEqual({});
	expect(cursorSchema.variants.custom).toEqual({
		customCursor: {
			type: 'text-content',
			default: '',
			description: 'Custom cursor',
			keyframable: false,
		},
	});
	expect(macOSCursorSchema['style.translate'].type).toBe('translate');
	expect(macOSCursorSchema['style.scale'].type).toBe('scale');
	expect(macOSCursorSchema['style.rotate'].type).toBe('rotation-css');
});

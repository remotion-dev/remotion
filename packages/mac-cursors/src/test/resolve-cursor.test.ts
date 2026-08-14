import {expect, test} from 'bun:test';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {Internals} from 'remotion';
import {MacOSCursor, macOSCursorSchema} from '../MacOSCursor';
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

test('cursor schema exposes named cursors as a keyframable enum', () => {
	expect(macOSCursorSchema.cursor.keyframable).toBe(true);
	expect(macOSCursorSchema.cursor.variants.default).toEqual({});
	expect(macOSCursorSchema.cursor.variants['ne-resize']).toEqual({});
	expect(macOSCursorSchema.cursor.variants.custom).toEqual({
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

test('<MacOSCursor> renders the default cursor when the cursor prop is omitted', () => {
	const compositionMetadata = {
		defaultCodec: null,
		defaultOutName: null,
		defaultPixelFormat: null,
		defaultProResProfile: null,
		defaultSampleRate: null,
		defaultVideoImageFormat: null,
		durationInFrames: 100,
		fps: 30,
		height: 1080,
		width: 1920,
		props: {},
	};
	const compositionManager = {
		compositions: [
			{
				id: 'comp',
				durationInFrames: 100,
				component: () => null,
				defaultProps: {},
				folderName: null,
				fps: 30,
				height: 1080,
				width: 1920,
				parentFolderName: null,
				nonce: [[0, 0]],
				calculateMetadata: null,
				schema: null,
				stack: null,
			},
		],
		folders: [],
		canvasContent: {type: 'composition' as const, compositionId: 'comp'},
		currentCompositionMetadata: compositionMetadata,
	} as React.ContextType<typeof Internals.CompositionManager>;
	const timeline = {
		frame: {comp: 0},
		playing: false,
		imperativePlaying: {current: false},
		audioAndVideoTags: {current: []},
	} as React.ContextType<typeof Internals.TimelineContext>;
	const markup = renderToString(
		React.createElement(
			Internals.CanUseRemotionHooks.Provider,
			{value: true},
			React.createElement(
				Internals.CompositionManager.Provider,
				{value: compositionManager},
				React.createElement(
					Internals.TimelineContext.Provider,
					{value: timeline},
					React.createElement(MacOSCursor),
				),
			),
		),
	);

	expect(markup).toContain('width:32px');
	expect(markup).toContain('height:32px');
});

import {expect, test} from 'bun:test';
import type {ReactElement} from 'react';
import {renderAnnotation} from '../render-annotation';

test('type none renders no annotation paths', () => {
	const result = renderAnnotation({
		rect: {x: 0, y: 0, w: 100, h: 40},
		config: {type: 'none'},
		seed: 1,
		progress: 1,
		options: {},
	});

	expect(result).toEqual([]);
});

test('circle iterations use different seeds', () => {
	const result = renderAnnotation({
		rect: {x: 0, y: 0, w: 100, h: 40},
		config: {
			type: 'circle',
			color: 'red',
			strokeWidth: 10,
			padding: {left: 0, right: 0, top: 0, bottom: 0},
			iterations: 2,
			box: 'inside',
		},
		seed: 1,
		progress: 1,
		options: {},
	});

	const paths = result.map(
		(path) => (path as ReactElement<{d: string}>).props.d,
	);
	expect(paths).toHaveLength(2);
	expect(paths[0]).not.toBe(paths[1]);
});

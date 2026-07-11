import {expect, test} from 'bun:test';
import {resolveAnnotationConfig} from '../types';

test('resolves defaults for annotation configs without zod', () => {
	expect(resolveAnnotationConfig({type: 'underline'})).toEqual({
		type: 'underline',
		color: 'currentColor',
		strokeWidth: 20,
		padding: {bottom: 0, left: 0, right: 0, top: 0},
		iterations: 2,
		rtl: false,
	});

	expect(resolveAnnotationConfig({type: 'bracket'})).toEqual({
		type: 'bracket',
		color: 'currentColor',
		strokeWidth: 20,
		padding: {bottom: 0, left: 0, right: 0, top: 0},
		brackets: ['right'],
	});

	expect(resolveAnnotationConfig({type: 'circle'})).toEqual({
		type: 'circle',
		color: 'currentColor',
		strokeWidth: 20,
		padding: {bottom: 0, left: 0, right: 0, top: 0},
		iterations: 2,
		box: 'around',
	});
});

test('resolves partial padding for annotation configs', () => {
	expect(
		resolveAnnotationConfig({
			type: 'highlight',
			padding: {left: 10, right: 5},
		}),
	).toEqual({
		type: 'highlight',
		color: 'currentColor',
		padding: {bottom: 0, left: 10, right: 5, top: 0},
		iterations: 2,
		rtl: false,
	});
});

test('validates annotation iterations at runtime', () => {
	expect(() =>
		resolveAnnotationConfig({type: 'highlight', iterations: 0}),
	).toThrow(/iterations/);
});

import {afterEach, expect, test} from 'bun:test';
import {cleanup, renderHook} from '@testing-library/react';
import {useCropStyle} from '../use-crop-style.js';

afterEach(() => {
	cleanup();
});

test('preserves the style object when no crop is applied', () => {
	const style = {clipPath: 'circle(50%)'};
	const {result} = renderHook(() =>
		useCropStyle({
			style,
			componentName: '<Test />',
		}),
	);

	expect(result.current).toBe(style);
});

test('memoizes the cropped style object', () => {
	const style = {opacity: 0.5};
	const {result, rerender} = renderHook(
		({cropLeft}: {readonly cropLeft: number}) =>
			useCropStyle({
				cropLeft,
				style,
				componentName: '<Test />',
			}),
		{initialProps: {cropLeft: 0.25}},
	);
	const firstStyle = result.current;

	expect(firstStyle).toEqual({opacity: 0.5, clipPath: 'inset(0% 0% 0% 25%)'});
	rerender({cropLeft: 0.25});
	expect(result.current).toBe(firstStyle);

	rerender({cropLeft: 0.5});
	expect(result.current).toEqual({
		opacity: 0.5,
		clipPath: 'inset(0% 0% 0% 50%)',
	});
	expect(result.current).not.toBe(firstStyle);
});

test('preserves the inline border radius on the cropped rectangle', () => {
	const {result} = renderHook(() =>
		useCropStyle({
			cropRight: 0.25,
			style: {borderRadius: '12px 24px'},
			componentName: '<Test />',
		}),
	);

	expect(result.current).toEqual({
		borderRadius: '12px 24px',
		clipPath: 'inset(0% 25% 0% 0% round 12px 24px)',
	});
});

test('preserves individual inline corner radii on the cropped rectangle', () => {
	const {result} = renderHook(() =>
		useCropStyle({
			cropBottom: 0.25,
			style: {
				borderTopLeftRadius: 12,
				borderBottomRightRadius: '25%',
			},
			componentName: '<Test />',
		}),
	);

	expect(result.current).toEqual({
		borderTopLeftRadius: 12,
		borderBottomRightRadius: '25%',
		clipPath: 'inset(0% 0% 25% 0% round 12px 0px 25% 0px)',
	});
});

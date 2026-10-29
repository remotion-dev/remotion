import {expect, test} from 'bun:test';
import type {RefObject} from 'react';
import type {CanvasCustomOutline} from '../outline-geometry';
import {measureCanvasOutlineTargets} from '../outline-measurement';

test('normalizes custom outline geometry to composition pixels', () => {
	const contentRoot = document.createElement('div');
	Object.defineProperties(contentRoot, {
		offsetWidth: {value: 200},
		offsetHeight: {value: 100},
	});
	contentRoot.getBoundingClientRect = () =>
		({
			left: 50,
			top: 20,
			width: 400,
			height: 300,
			right: 450,
			bottom: 320,
		}) as DOMRect;

	const customOutline = {
		type: 'custom',
		measure: () => ({
			points: [
				{x: 90, y: 50},
				{x: 250, y: 50},
				{x: 250, y: 170},
				{x: 90, y: 170},
			] as const,
			dimensions: {width: 160, height: 120},
		}),
	} as CanvasCustomOutline;

	const outlines = measureCanvasOutlineTargets(contentRoot, [
		{
			key: 'three-object',
			ref: {current: customOutline} as RefObject<CanvasCustomOutline>,
			crop: {left: 0.25, right: 0.25, top: 0, bottom: 0.5},
			includeOutsideContainer: true,
		},
	]);

	expect(outlines).toEqual([
		{
			key: 'three-object',
			dimensions: {width: 80, height: 40},
			uncroppedPoints: [
				{x: 20, y: 10},
				{x: 100, y: 10},
				{x: 100, y: 50},
				{x: 20, y: 50},
			],
			points: [
				{x: 40, y: 10},
				{x: 80, y: 10},
				{x: 80, y: 30},
				{x: 40, y: 30},
			],
			path: null,
		},
	]);
});

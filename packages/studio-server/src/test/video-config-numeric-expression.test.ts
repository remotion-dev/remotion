import {expect, test} from 'bun:test';
import * as recast from 'recast';
import {
	parseVideoConfigNumericExpression,
	updateVideoConfigNumericExpression,
} from '../helpers/video-config-numeric-expression';
import {parseExpression} from './test-utils';

const videoConfigValues = {
	durationInFrames: 120,
	fps: 30,
	height: 1080,
	width: 1920,
};

const printExpression = (
	node: ReturnType<typeof updateVideoConfigNumericExpression>,
) => recast.print(node).code;

test('parseVideoConfigNumericExpression parses durationInFrames subtraction', () => {
	expect(
		parseVideoConfigNumericExpression({
			node: parseExpression('durationInFrames - 1'),
			videoConfigValues,
		}),
	).toEqual({
		type: 'video-config-subtraction',
		identifier: 'durationInFrames',
		amount: 1,
		configValue: 120,
		amountPosition: 'right',
		value: 119,
	});

	expect(
		parseVideoConfigNumericExpression({
			node: parseExpression('1 - durationInFrames'),
			videoConfigValues,
		}),
	).toEqual({
		type: 'video-config-subtraction',
		identifier: 'durationInFrames',
		amount: 1,
		configValue: 120,
		amountPosition: 'left',
		value: -119,
	});
});

test('updateVideoConfigNumericExpression preserves subtraction shape', () => {
	const expression = parseVideoConfigNumericExpression({
		node: parseExpression('durationInFrames - 1'),
		videoConfigValues,
	});
	expect(expression?.type).toBe('video-config-subtraction');
	if (expression?.type !== 'video-config-subtraction') {
		throw new Error('expected subtraction');
	}

	expect(
		printExpression(
			updateVideoConfigNumericExpression({expression, value: 100}),
		),
	).toBe('durationInFrames - 20');

	expect(
		printExpression(
			updateVideoConfigNumericExpression({expression, value: 120}),
		),
	).toBe('durationInFrames');
});

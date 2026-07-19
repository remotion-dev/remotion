import {expect, test} from 'bun:test';
import {
	parseKeyframeClipboardData,
	parseKeyframeClipboardDataResult,
} from '../keyframe-clipboard-data';

test('parses keyframe clipboard data', () => {
	expect(
		parseKeyframeClipboardData(
			JSON.stringify({
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: 'number',
				keyframes: [
					{frameOffset: 0, value: 0.5},
					{frameOffset: 20, value: 1},
				],
				easing: [{type: 'linear'}],
			}),
		),
	).toEqual({
		type: 'keyframe',
		version: 1,
		remotionClipboard: 'keyframe',
		fieldType: 'number',
		keyframes: [
			{frameOffset: 0, value: 0.5},
			{frameOffset: 20, value: 1},
		],
		easing: [{type: 'linear'}],
	});
});

test('allows keyframes without a schema field type', () => {
	expect(
		parseKeyframeClipboardData(
			JSON.stringify({
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: null,
				keyframes: [{frameOffset: 0, value: '#ff0000'}],
				easing: [],
			}),
		),
	).not.toBe(null);
});

test('rejects invalid and unsupported keyframe clipboard data', () => {
	expect(
		parseKeyframeClipboardDataResult(
			JSON.stringify({
				type: 'keyframe',
				version: 2,
				remotionClipboard: 'keyframe',
				fieldType: 'number',
				keyframes: [{frameOffset: 0, value: 1}],
				easing: [],
			}),
		),
	).toEqual({status: 'unsupported-version', version: 2});
	expect(
		parseKeyframeClipboardData(
			JSON.stringify({
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: 'array',
				keyframes: [{frameOffset: 0, value: []}],
				easing: [],
			}),
		),
	).toBe(null);
	expect(
		parseKeyframeClipboardData(
			JSON.stringify({
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: 'number',
				keyframes: [
					{frameOffset: 10, value: 1},
					{frameOffset: 5, value: 2},
				],
				easing: [{type: 'linear'}],
			}),
		),
	).toBe(null);
	expect(
		parseKeyframeClipboardData(
			JSON.stringify({
				type: 'keyframe',
				version: 1,
				remotionClipboard: 'keyframe',
				fieldType: 'number',
				keyframes: [
					{frameOffset: 0, value: 1},
					{frameOffset: 10, value: 2},
				],
				easing: [],
			}),
		),
	).toBe(null);
});

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
				value: 0.5,
			}),
		),
	).toEqual({
		type: 'keyframe',
		version: 1,
		remotionClipboard: 'keyframe',
		fieldType: 'number',
		value: 0.5,
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
				value: '#ff0000',
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
				value: 1,
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
				value: [],
			}),
		),
	).toBe(null);
});

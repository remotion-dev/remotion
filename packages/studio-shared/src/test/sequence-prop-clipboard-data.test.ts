import {expect, test} from 'bun:test';
import {
	parseSequencePropClipboardData,
	parseSequencePropClipboardDataResult,
} from '../sequence-prop-clipboard-data';

test('parses static and keyframed sequence prop clipboard data', () => {
	expect(
		parseSequencePropClipboardData(
			JSON.stringify({
				type: 'sequence-prop',
				version: 1,
				remotionClipboard: 'sequence-prop',
				key: 'style.rotate',
				fieldType: 'rotation-css',
				param: {type: 'static', value: '45deg'},
			}),
		),
	).toEqual({
		type: 'sequence-prop',
		version: 1,
		remotionClipboard: 'sequence-prop',
		key: 'style.rotate',
		fieldType: 'rotation-css',
		param: {type: 'static', value: '45deg'},
	});

	expect(
		parseSequencePropClipboardData(
			JSON.stringify({
				type: 'sequence-prop',
				version: 1,
				remotionClipboard: 'sequence-prop',
				key: 'style.rotate',
				fieldType: 'rotation-css',
				param: {
					type: 'keyframed',
					interpolationFunction: 'interpolate',
					keyframes: [
						{frame: 0, value: '0deg'},
						{frame: 30, value: '90deg'},
					],
					easing: [{type: 'linear'}],
					clamping: {left: 'extend', right: 'extend'},
				},
			}),
		)?.param,
	).toEqual({
		type: 'keyframed',
		interpolationFunction: 'interpolate',
		keyframes: [
			{frame: 0, value: '0deg'},
			{frame: 30, value: '90deg'},
		],
		easing: [{type: 'linear'}],
		clamping: {left: 'extend', right: 'extend'},
	});
});

test('rejects incompatible and unsupported sequence prop clipboard data', () => {
	expect(
		parseSequencePropClipboardData(
			JSON.stringify({
				type: 'sequence-prop',
				version: 1,
				remotionClipboard: 'sequence-prop',
				key: 'style.rotate',
				fieldType: 'boolean',
				param: {type: 'static', value: true},
			}),
		),
	).toBe(null);

	expect(
		parseSequencePropClipboardDataResult(
			JSON.stringify({
				type: 'sequence-prop',
				version: 2,
				remotionClipboard: 'sequence-prop',
			}),
		),
	).toEqual({status: 'unsupported-version', version: 2});
});

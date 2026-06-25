import {expect, test} from 'bun:test';
import type {
	CanUpdateSequencePropsResponse,
	InteractivitySchema,
} from 'remotion';
import {
	optimisticAddEffectKeyframe,
	optimisticAddSequenceKeyframe,
} from '../optimistic-add-keyframe';

test('optimisticAddSequenceKeyframe converts a static prop to a single keyframe', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			opacity: {
				status: 'static',
				codeValue: 0.5,
			},
		},
		effects: [],
	};

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'opacity',
		frame: 25,
		value: 0.75,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.opacity;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 25, value: 0.75}]);
	expect(status.easing).toEqual([]);
	expect(status.clamping).toEqual({left: 'clamp', right: 'clamp'});
});

test('optimisticAddSequenceKeyframe adds a missing prop before keyframing it', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [],
	};
	const schema = {
		opacity: {
			type: 'number',
			default: 1,
			hiddenFromList: false,
		},
	} satisfies InteractivitySchema;

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'opacity',
		frame: 25,
		value: 0.75,
		schema,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.opacity;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 25, value: 0.75}]);
	expect(status.interpolationFunction).toBe('interpolate');
});

test('optimisticAddSequenceKeyframe uses interpolate for translate fields', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.translate': {
				status: 'static',
				codeValue: '0px 59px',
			},
		},
		effects: [],
	};
	const schema = {
		'style.translate': {
			type: 'translate',
			default: '0px 0px',
		},
	} satisfies InteractivitySchema;

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'style.translate',
		frame: 44,
		value: '0px 59px',
		schema,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props['style.translate'];
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.interpolationFunction).toBe('interpolate');
	expect(status.keyframes).toEqual([{frame: 44, value: '0px 59px'}]);
	expect(status.clamping).toEqual({left: 'clamp', right: 'clamp'});
});

test('optimisticAddSequenceKeyframe uses interpolate for rotation-css fields', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			'style.rotate': {
				status: 'static',
				codeValue: '0deg',
			},
		},
		effects: [],
	};
	const schema = {
		'style.rotate': {
			type: 'rotation-css',
			default: '0deg',
		},
	} satisfies InteractivitySchema;

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'style.rotate',
		frame: 44,
		value: '19deg',
		schema,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props['style.rotate'];
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.interpolationFunction).toBe('interpolate');
	expect(status.keyframes).toEqual([{frame: 44, value: '19deg'}]);
	expect(status.clamping).toEqual({left: 'clamp', right: 'clamp'});
});

test('optimisticAddSequenceKeyframe ignores non-keyframable fields', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			playbackRate: {
				status: 'static',
				codeValue: 1,
			},
		},
		effects: [],
	};
	const schema = {
		playbackRate: {
			type: 'number',
			default: 1,
			hiddenFromList: false,
			keyframable: false,
		},
	} satisfies InteractivitySchema;

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'playbackRate',
		frame: 25,
		value: 2,
		schema,
	});

	expect(updated).toEqual(previous);
});

test('optimisticAddSequenceKeyframe ignores enum fields', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			layout: {
				status: 'static',
				codeValue: 'absolute-fill',
			},
		},
		effects: [],
	};
	const schema = {
		layout: {
			type: 'enum',
			default: 'absolute-fill',
			variants: {
				'absolute-fill': {},
				none: {},
			},
		},
	} satisfies InteractivitySchema;

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'layout',
		frame: 25,
		value: 'none',
		schema,
	});

	expect(updated).toEqual(previous);
});

test('optimisticAddSequenceKeyframe appends a keyframe to an existing interpolation', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			scale: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 1},
					{frame: 60, value: 2},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'scale',
		frame: 30,
		value: 1.5,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 1},
		{frame: 30, value: 1.5},
		{frame: 60, value: 2},
	]);
	expect(status.easing).toEqual([{type: 'linear'}, {type: 'linear'}]);
});

test('optimisticAddSequenceKeyframe duplicates the easing for the split segment', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			scale: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 1},
					{frame: 31, value: 2},
					{frame: 60, value: 3},
				],
				easing: [
					{type: 'linear'},
					{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
				],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'scale',
		frame: 38,
		value: 2.5,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.easing).toEqual([
		{type: 'linear'},
		{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
		{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
	]);
});

test('optimisticAddSequenceKeyframe uses linear easing outside the keyframe range', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			scale: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 1},
					{frame: 60, value: 3},
				],
				easing: [{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'scale',
		frame: 90,
		value: 4,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.easing).toEqual([
		{type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1},
		{type: 'linear'},
	]);
});

test('optimisticAddSequenceKeyframe updates an existing keyframe at the same frame', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {
			scale: {
				status: 'keyframed',
				interpolationFunction: 'interpolate',
				keyframes: [
					{frame: 0, value: 1},
					{frame: 60, value: 2},
				],
				easing: [{type: 'linear'}],
				clamping: {left: 'extend', right: 'extend'},
				posterize: undefined,
			},
		},
		effects: [],
	};

	const updated = optimisticAddSequenceKeyframe({
		previous,
		fieldKey: 'scale',
		frame: 60,
		value: 3,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const status = updated.props.scale;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 1},
		{frame: 60, value: 3},
	]);
	expect(status.easing).toEqual([{type: 'linear'}]);
});

test('optimisticAddEffectKeyframe appends a keyframe on the target effect', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'tint',
				importPath: null,
				props: {
					amount: {
						status: 'keyframed',
						interpolationFunction: 'interpolate',
						keyframes: [{frame: 0, value: 0.2}],
						easing: [],
						clamping: {left: 'extend', right: 'extend'},
						posterize: undefined,
					},
				},
			},
		],
	};

	const updated = optimisticAddEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		frame: 30,
		value: 0.5,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected updateable effect');
	}

	const status = effect.props.amount;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([
		{frame: 0, value: 0.2},
		{frame: 30, value: 0.5},
	]);
});

test('optimisticAddEffectKeyframe converts a static prop to a single keyframe', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'tint',
				importPath: null,
				props: {
					amount: {
						status: 'static',
						codeValue: 0.2,
					},
				},
			},
		],
	};

	const updated = optimisticAddEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'amount',
		frame: 30,
		value: 0.5,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected updateable effect');
	}

	const status = effect.props.amount;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 30, value: 0.5}]);
	expect(status.easing).toEqual([]);
	expect(status.clamping).toEqual({left: 'clamp', right: 'clamp'});
});

test('optimisticAddEffectKeyframe adds a missing prop before keyframing it', () => {
	const previous: CanUpdateSequencePropsResponse = {
		canUpdate: true,
		props: {},
		effects: [
			{
				canUpdate: true,
				effectIndex: 0,
				callee: 'linearProgressiveBlur',
				importPath: '@remotion/effects/linear-progressive-blur',
				props: {},
			},
		],
	};
	const schema = {
		startBlur: {
			type: 'number',
			default: 0,
			hiddenFromList: false,
		},
	} satisfies InteractivitySchema;

	const updated = optimisticAddEffectKeyframe({
		previous,
		effectIndex: 0,
		fieldKey: 'startBlur',
		frame: 55,
		value: 12,
		schema,
	});

	if (!updated.canUpdate) {
		throw new Error('expected updateable sequence');
	}

	const effect = updated.effects[0];
	if (!effect.canUpdate) {
		throw new Error('expected updateable effect');
	}

	const status = effect.props.startBlur;
	if (!status || status.status !== 'keyframed') {
		throw new Error('expected keyframed status');
	}

	expect(status.keyframes).toEqual([{frame: 55, value: 12}]);
	expect(status.interpolationFunction).toBe('interpolate');
});

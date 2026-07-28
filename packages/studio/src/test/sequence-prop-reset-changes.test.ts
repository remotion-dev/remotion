import {expect, test} from 'bun:test';
import type {InteractivitySchema, SequencePropsSubscriptionKey} from 'remotion';
import {getSequencePropResetChanges} from '../components/Timeline/get-sequence-prop-reset-changes';

const nodePath: SequencePropsSubscriptionKey = {
	absolutePath: '/project/src/Comp.tsx',
	nodePath: ['body', 0],
	sequenceKeys: [],
	effectKeys: [],
	videoConfigValues: null,
};

test('sequence prop resets expand style shorthands using each schema default', () => {
	const schema = {
		'style.borderRadius': {
			type: 'number',
			default: 0,
			hiddenFromList: false,
		},
		'style.borderTopLeftRadius': {
			type: 'number',
			default: 1,
			hiddenFromList: false,
		},
		'style.borderTopRightRadius': {
			type: 'number',
			default: 2,
			hiddenFromList: false,
		},
		'style.borderBottomRightRadius': {
			type: 'number',
			default: 3,
			hiddenFromList: false,
		},
		'style.borderBottomLeftRadius': {
			type: 'number',
			default: 4,
			hiddenFromList: false,
		},
	} satisfies InteractivitySchema;

	const changes = getSequencePropResetChanges({
		fileName: nodePath.absolutePath,
		nodePath,
		fieldKey: 'style.borderRadius',
		value: 0,
		defaultValue: '0',
		schema,
	});

	expect(
		changes.map(({fieldKey, value, defaultValue}) => ({
			fieldKey,
			value,
			defaultValue,
		})),
	).toEqual([
		{fieldKey: 'style.borderRadius', value: 0, defaultValue: '0'},
		{fieldKey: 'style.borderTopLeftRadius', value: 1, defaultValue: '1'},
		{fieldKey: 'style.borderTopRightRadius', value: 2, defaultValue: '2'},
		{fieldKey: 'style.borderBottomRightRadius', value: 3, defaultValue: '3'},
		{fieldKey: 'style.borderBottomLeftRadius', value: 4, defaultValue: '4'},
	]);
});

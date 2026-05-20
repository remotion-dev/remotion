import {expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import {
	getExpandedRowDepth,
	getTimelineRowPaddingLeft,
} from '../components/Timeline/timeline-row-layout';
import type {SequenceNodePathInfo} from '../helpers/get-timeline-sequence-sort-key';
import {
	buildTimelineTree,
	flattenVisibleTreeNodes,
} from '../helpers/timeline-layout';

const nodePathInfo: SequenceNodePathInfo = {
	sequenceSubscriptionKey: {
		nodePath: ['Composition', 'Sequence'],
		overrideId: 'test',
	},
	auxiliaryKeys: [],
	index: 0,
	numberOfSequencesWithThisNodePath: 1,
};

const makeSequence = (): TSequence => ({
	from: 0,
	duration: 100,
	id: 'seq-1',
	displayName: 'HtmlInCanvas',
	parent: null,
	rootId: 'seq-1',
	showInTimeline: true,
	type: 'sequence',
	nonce: [[0, 0]],
	getStack: () => null,
	premountDisplay: null,
	postmountDisplay: null,
	controls: {
		overrideId: 'test',
		schema: {
			translate: {
				type: 'translate',
				description: 'Translate',
			},
		},
		currentRuntimeValueDotNotation: {},
	},
	effects: [
		{
			label: 'Halftone',
			schema: {
				color: {
					type: 'color',
					description: 'Color',
				},
			},
		},
	],
});

test('effect field auxiliaryKeys include effect path', () => {
	const tree = buildTimelineTree({
		sequence: makeSequence(),
		nodePathInfo,
		getDragOverrides: () => ({}),
		codeValues: {},
	});

	const effectsGroup = tree.find(
		(n) => n.kind === 'group' && n.label === 'Effects',
	);
	expect(effectsGroup?.kind).toBe('group');
	if (effectsGroup?.kind !== 'group') {
		throw new Error('expected Effects group');
	}

	const halftone = effectsGroup.children[0];
	expect(halftone.kind).toBe('group');
	if (halftone.kind !== 'group') {
		throw new Error('expected Halftone group');
	}

	const colorField = halftone.children[0];
	expect(colorField.kind).toBe('field');
	if (colorField.kind !== 'field') {
		throw new Error('expected Color field');
	}

	expect(colorField.nodePathInfo.auxiliaryKeys).toEqual([
		'effects',
		'0',
		'color',
	]);
});

test('flattenVisibleTreeNodes assigns increasing tree depth', () => {
	const tree = buildTimelineTree({
		sequence: makeSequence(),
		nodePathInfo,
		getDragOverrides: () => ({}),
		codeValues: {},
	});

	const flat = flattenVisibleTreeNodes({
		nodes: tree,
		getIsExpanded: () => true,
	});

	expect(flat.map(({node, depth}) => ({label: node.label, depth}))).toEqual([
		{label: 'Effects', depth: 0},
		{label: 'Halftone', depth: 1},
		{label: 'Color', depth: 2},
		{label: 'Translate', depth: 0},
	]);
});

test('getExpandedRowDepth combines composition and tree depth', () => {
	expect(
		getExpandedRowDepth({
			nestedDepth: 1,
			treeDepth: 2,
		}),
	).toBe(4);
	expect(getTimelineRowPaddingLeft(4)).toBe(45);
});

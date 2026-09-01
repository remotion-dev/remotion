import {expect, test} from 'bun:test';
import {reorderSequence} from '../codemods/reorder-sequence';
import {lineColumnToNodePath, lineContainingToNodePath} from './test-utils';

const buildInput = () => `import {Sequence} from 'remotion';

export const Comp = () => {
	return (
		<>
			<Sequence name="a" from={0} />
			<Sequence name="b" from={10} />
			<Sequence name="c" from={20} />
		</>
	);
};
`;

test('reorderSequence moves a sequence forward', async () => {
	const input = buildInput();
	const {output, sequenceLabel, nodePathRemappings} = await reorderSequence({
		input,
		sourceNodePath: lineColumnToNodePath(input, 6),
		targetNodePath: lineColumnToNodePath(input, 8),
		position: 'after',
	});

	expect(sequenceLabel).toBe('<Sequence>');
	expect(output.indexOf('name="b"')).toBeLessThan(output.indexOf('name="c"'));
	expect(output.indexOf('name="c"')).toBeLessThan(output.indexOf('name="a"'));
	expect(nodePathRemappings).toEqual([
		{
			oldNodePath: lineContainingToNodePath(input, 'name="a"'),
			newNodePath: lineContainingToNodePath(output, 'name="a"'),
		},
		{
			oldNodePath: lineContainingToNodePath(input, 'name="b"'),
			newNodePath: lineContainingToNodePath(output, 'name="b"'),
		},
		{
			oldNodePath: lineContainingToNodePath(input, 'name="c"'),
			newNodePath: lineContainingToNodePath(output, 'name="c"'),
		},
	]);
});

test('reorderSequence moves a sequence backward', async () => {
	const input = buildInput();
	const {output, sequenceLabel} = await reorderSequence({
		input,
		sourceNodePath: lineColumnToNodePath(input, 8),
		targetNodePath: lineColumnToNodePath(input, 6),
		position: 'before',
	});

	expect(sequenceLabel).toBe('<Sequence>');
	expect(output.indexOf('name="c"')).toBeLessThan(output.indexOf('name="a"'));
	expect(output.indexOf('name="a"')).toBeLessThan(output.indexOf('name="b"'));
});

test('reorderSequence rejects sequences with different JSX parents', async () => {
	const input = `import {Sequence} from 'remotion';

export const Comp = () => {
	return (
		<>
			<div>
				<Sequence name="a" from={0} />
			</div>
			<Sequence name="b" from={10} />
		</>
	);
};
`;

	await expect(
		reorderSequence({
			input,
			sourceNodePath: lineColumnToNodePath(input, 7),
			targetNodePath: lineColumnToNodePath(input, 9),
			position: 'before',
		}),
	).rejects.toThrow(/not JSX siblings/);
});

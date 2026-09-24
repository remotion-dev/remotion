import {expect, test} from 'bun:test';
import {getJsxNodes} from '../get-jsx-nodes';
import {reorderSequence} from '../reorder-sequence';
import {lineColumnToNodePath} from './node-path-test-utils';

const sequenceContaining = (input: string, search: string) => {
	const searchOffset = input.indexOf(search);
	if (searchOffset === -1) {
		throw new Error(`Could not find ${JSON.stringify(search)} in source`);
	}

	const openingOffset = input.lastIndexOf('<Sequence', searchOffset);
	if (openingOffset === -1) {
		throw new Error(
			`Could not find a Sequence containing ${JSON.stringify(search)}`,
		);
	}

	const sourceBeforeOpening = input.slice(0, openingOffset).split('\n');
	const nodePath = getJsxNodes({
		project: {rootDir: '/', files: {'/test.tsx': input}},
		filePath: '/test.tsx',
	}).find(
		(node) =>
			node.location?.line === sourceBeforeOpening.length &&
			node.location.column === (sourceBeforeOpening.at(-1)?.length ?? 0),
	)?.nodePath;
	if (!nodePath) {
		throw new Error(
			`Could not resolve a Sequence containing ${JSON.stringify(search)}`,
		);
	}

	return nodePath;
};

const buildInput = () => `import {Sequence} from 'remotion'

const untouched    = {keep:"this spacing"}

export const Comp=()=>{
	return (
		<>
			<Sequence name='a' from = {0}/>
			{/* keep this comment before b */}
			<Sequence
				name='b'
				from = {10}
			/>
			<Sequence name='c' from={20}/>
		</>
	)
}
`;

test('reorderSequence moves a sequence forward without formatting the file', async () => {
	const input = buildInput();
	let formatCalls = 0;
	const {output, sequenceLabel, nodePathRemappings} = await reorderSequence({
		input,
		sourceNodePath: sequenceContaining(input, "name='a'"),
		targetNodePath: sequenceContaining(input, "name='c'"),
		position: 'after',
		formatFile: () => {
			formatCalls++;
			throw new Error('Prettier must not be called');
		},
	});

	expect(sequenceLabel).toBe('<Sequence>');
	expect(formatCalls).toBe(0);
	expect(output).toBe(`import {Sequence} from 'remotion'

const untouched    = {keep:"this spacing"}

export const Comp=()=>{
	return (
		<>
			{/* keep this comment before b */}
			<Sequence
				name='b'
				from = {10}
			/>
			<Sequence name='c' from={20}/>
			<Sequence name='a' from = {0}/>
		</>
	)
}
`);
	expect(nodePathRemappings).toEqual([
		{
			oldNodePath: sequenceContaining(input, "name='a'"),
			newNodePath: sequenceContaining(output, "name='a'"),
		},
		{
			oldNodePath: sequenceContaining(input, "name='b'"),
			newNodePath: sequenceContaining(output, "name='b'"),
		},
		{
			oldNodePath: sequenceContaining(input, "name='c'"),
			newNodePath: sequenceContaining(output, "name='c'"),
		},
	]);
});

test('reorderSequence moves a sequence backward', async () => {
	const input = buildInput();
	const {output, sequenceLabel} = await reorderSequence({
		input,
		sourceNodePath: sequenceContaining(input, "name='c'"),
		targetNodePath: sequenceContaining(input, "name='a'"),
		position: 'before',
	});

	expect(sequenceLabel).toBe('<Sequence>');
	expect(output).toBe(`import {Sequence} from 'remotion'

const untouched    = {keep:"this spacing"}

export const Comp=()=>{
	return (
		<>
			<Sequence name='c' from={20}/>
			<Sequence name='a' from = {0}/>
			{/* keep this comment before b */}
			<Sequence
				name='b'
				from = {10}
			/>
		</>
	)
}
`);
});

test('reorderSequence preserves CRLF and multiline JSX', async () => {
	const input = [
		'export const Comp = () => (',
		'  <>',
		'    <Sequence name="a" />',
		'    <Sequence',
		'      name="b"',
		'      style = {{opacity:1}}',
		'    />',
		'    <Sequence name="c" />',
		'  </>',
		')',
		'',
	].join('\r\n');

	const {output} = await reorderSequence({
		input,
		sourceNodePath: sequenceContaining(input, 'name="b"'),
		targetNodePath: sequenceContaining(input, 'name="c"'),
		position: 'after',
	});

	expect(output).toBe(
		[
			'export const Comp = () => (',
			'  <>',
			'    <Sequence name="a" />',
			'    <Sequence name="c" />',
			'    <Sequence',
			'      name="b"',
			'      style = {{opacity:1}}',
			'    />',
			'  </>',
			')',
			'',
		].join('\r\n'),
	);
});

test('reorderSequence keeps inline siblings parseable', async () => {
	const input =
		'export const Comp=()=> <><Sequence name="a"/><Sequence name="b"/></>;\n';

	const {output} = await reorderSequence({
		input,
		sourceNodePath: sequenceContaining(input, 'name="a"'),
		targetNodePath: sequenceContaining(input, 'name="b"'),
		position: 'after',
	});

	expect(output).toBe(
		'export const Comp=()=> <><Sequence name="b"/>\n<Sequence name="a"/></>;\n',
	);
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

test('reorderSequence rejects identical source and target sequences', async () => {
	const input = buildInput();
	const nodePath = sequenceContaining(input, "name='a'");

	await expect(
		reorderSequence({
			input,
			sourceNodePath: nodePath,
			targetNodePath: nodePath,
			position: 'after',
		}),
	).rejects.toThrow(/source and target are identical/);
});

import {expect, test} from 'bun:test';
import {getNodes} from '../get-nodes';
import {reorderSequences} from '../reorder-sequence';
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
	const nodePath = getNodes({
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

test('reorderSequences moves a sequence forward without formatting the file', () => {
	const input = buildInput();
	const {output, sequenceLabel, nodePathRemappings} = reorderSequences({
		input,
		sourceNodePaths: [sequenceContaining(input, "name='a'")],
		targetNodePath: sequenceContaining(input, "name='c'"),
		position: 'after',
	});

	expect(sequenceLabel).toBe('<Sequence>');
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
			oldJsxName: 'Sequence',
			newJsxName: 'Sequence',
		},
		{
			oldNodePath: sequenceContaining(input, "name='b'"),
			newNodePath: sequenceContaining(output, "name='b'"),
			oldJsxName: 'Sequence',
			newJsxName: 'Sequence',
		},
		{
			oldNodePath: sequenceContaining(input, "name='c'"),
			newNodePath: sequenceContaining(output, "name='c'"),
			oldJsxName: 'Sequence',
			newJsxName: 'Sequence',
		},
	]);
});

test('reorderSequences moves a sequence backward', () => {
	const input = buildInput();
	const {output, sequenceLabel} = reorderSequences({
		input,
		sourceNodePaths: [sequenceContaining(input, "name='c'")],
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

test('reorderSequences preserves CRLF and multiline JSX', () => {
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

	const {output} = reorderSequences({
		input,
		sourceNodePaths: [sequenceContaining(input, 'name="b"')],
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

test('reorderSequences keeps inline siblings parseable', () => {
	const input =
		'export const Comp=()=> <><Sequence name="a"/><Sequence name="b"/></>;\n';

	const {output} = reorderSequences({
		input,
		sourceNodePaths: [sequenceContaining(input, 'name="a"')],
		targetNodePath: sequenceContaining(input, 'name="b"'),
		position: 'after',
	});

	expect(output).toBe(
		'export const Comp=()=> <><Sequence name="b"/>\n<Sequence name="a"/></>;\n',
	);
});

test('reorderSequences rejects sequences with different JSX parents', () => {
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

	expect(() =>
		reorderSequences({
			input,
			sourceNodePaths: [lineColumnToNodePath(input, 7)],
			targetNodePath: lineColumnToNodePath(input, 9),
			position: 'before',
		}),
	).toThrow(/not JSX siblings/);
});

test('reorderSequences rejects identical source and target sequences', () => {
	const input = buildInput();
	const nodePath = sequenceContaining(input, "name='a'");

	expect(() =>
		reorderSequences({
			input,
			sourceNodePaths: [nodePath],
			targetNodePath: nodePath,
			position: 'after',
		}),
	).toThrow(/relative to a selected sequence/);
});

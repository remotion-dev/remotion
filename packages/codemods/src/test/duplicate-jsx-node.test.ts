import {expect, test} from 'bun:test';
import {duplicateNodes} from '../duplicate-jsx-node';
import {
	lineColumnToNodePath,
	lineContainingToNodePath,
} from './node-path-test-utils';

const sample = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const X: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
		</AbsoluteFill>
	);
};
`;

test('duplicateNodes inserts a sibling JSX element', async () => {
	const {output} = await duplicateNodes({
		input: sample,
		nodePaths: [lineColumnToNodePath(sample, 7)],
	});

	const divOpens = output.match(/<div/g);
	expect(divOpens?.length).toBe(2);
	expect(output).toContain('<AbsoluteFill>');
});

test('duplicateNodes remaps following JSX siblings', async () => {
	const input = `export const X = () => (
	<div>
		<span name="duplicate" />
		<span name="following" />
	</div>
);
`;
	const {output, nodePathRemappings} = await duplicateNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'name="duplicate"')],
	});

	expect(nodePathRemappings).toEqual([
		{
			oldNodePath: lineContainingToNodePath(input, 'name="following"'),
			newNodePath: lineContainingToNodePath(output, 'name="following"'),
		},
		{
			oldNodePath: null,
			newNodePath: lineContainingToNodePath(output, 'name="duplicate-copy"'),
		},
	]);
});

test('duplicateNodes duplicates each requested JSX element once', async () => {
	const input = `export const X = () => (
	<div>
		<span name="first" />
		<span name="second" />
		<span name="untouched" />
	</div>
);
`;
	const {output} = await duplicateNodes({
		input,
		nodePaths: [
			lineContainingToNodePath(input, 'name="first"'),
			lineContainingToNodePath(input, 'name="second"'),
		],
	});

	expect(output.match(/name="first-copy"/g)).toHaveLength(1);
	expect(output.match(/name="second-copy"/g)).toHaveLength(1);
	expect(output).not.toContain('name="first-copy-copy"');
	expect(output.match(/name="untouched"/g)).toHaveLength(1);
});

const onlyReturn = `import React from 'react';

export const X: React.FC = () => {
	return <div />;
};
`;

test('duplicateNodes wraps sole return JSX in a fragment with two elements', async () => {
	const {output} = await duplicateNodes({
		input: onlyReturn,
		nodePaths: [lineColumnToNodePath(onlyReturn, 4)],
	});

	expect(output).toBe(`import React from 'react';

export const X: React.FC = () => {
	return <>
		<div />
		<div />
	</>;
};
`);
});

const mapCase = `import React from 'react';

export const X: React.FC = () => {
	return (
		<>
			{[1].map((i) => (
				<div key={i} />
			))}
		</>
	);
};
`;

test('duplicateNodes duplicates JSX inside map callback', async () => {
	const {output} = await duplicateNodes({
		input: mapCase,
		nodePaths: [lineColumnToNodePath(mapCase, 7)],
	});

	const divOpens = output.match(/<div/g);
	expect(divOpens?.length).toBe(2);
});

test('duplicateNodes preserves surrounding source formatting', async () => {
	const input = `export const X=()=>(
  <div data={{value:1}}>
    <span name='first' data-value = {1}/>
    <span name='untouched'/>
  </div>
)
`;
	const {output} = await duplicateNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, "name='first'")],
	});

	expect(output).toBe(`export const X=()=>(
  <div data={{value:1}}>
    <span name='first' data-value = {1}/>
    <span name='first-copy' data-value = {1}/>
    <span name='untouched'/>
  </div>
)
`);
});

test('duplicateNodes preserves CRLF line endings', async () => {
	const input = [
		'export const X = () => (',
		'  <div>',
		'    <span name="first" />',
		'  </div>',
		');',
		'',
	].join('\r\n');
	const {output} = await duplicateNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'name="first"')],
	});

	expect(output).toBe(
		[
			'export const X = () => (',
			'  <div>',
			'    <span name="first" />',
			'    <span name="first-copy" />',
			'  </div>',
			');',
			'',
		].join('\r\n'),
	);
});

test('duplicateNodes preserves inline JSX spacing', async () => {
	const input =
		'export const X = () => <div><Keep /> <Copy name="item" /><Keep /></div>;\n';
	const {output} = await duplicateNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, '<Copy name="item"')],
	});

	expect(output).toBe(
		'export const X = () => <div><Keep /> <Copy name="item" /> <Copy name="item-copy" /><Keep /></div>;\n',
	);
});

test('duplicateNodes preserves multiline JSX formatting', async () => {
	const input = `export const X = () => (
  <div>
    <Item
      name={'item'}
      value = {{nested:true}}
    />
  </div>
);
`;
	const {output} = await duplicateNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, '<Item')],
	});

	expect(output).toBe(`export const X = () => (
  <div>
    <Item
      name={'item'}
      value = {{nested:true}}
    />
    <Item
      name={'item-copy'}
      value = {{nested:true}}
    />
  </div>
);
`);
});

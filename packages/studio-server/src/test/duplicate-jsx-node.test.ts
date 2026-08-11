import {expect, test} from 'bun:test';
import {duplicateJsxNode} from '../codemods/duplicate-jsx-node';
import {lineColumnToNodePath, lineContainingToNodePath} from './test-utils';

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

test('duplicateJsxNode inserts a sibling JSX element', async () => {
	const {output} = await duplicateJsxNode({
		input: sample,
		nodePath: lineColumnToNodePath(sample, 7),
	});

	const divOpens = output.match(/<div/g);
	expect(divOpens?.length).toBe(2);
	expect(output).toContain('<AbsoluteFill>');
});

test('duplicateJsxNode remaps following JSX siblings', async () => {
	const input = `export const X = () => (
	<div>
		<span data-name="duplicate" />
		<span data-name="following" />
	</div>
);
`;
	const {output, nodePathRemappings} = await duplicateJsxNode({
		input,
		nodePath: lineContainingToNodePath(input, 'data-name="duplicate"'),
	});

	expect(nodePathRemappings).toEqual([
		{
			oldNodePath: lineContainingToNodePath(input, 'data-name="following"'),
			newNodePath: lineContainingToNodePath(output, 'data-name="following"'),
		},
	]);
});

const onlyReturn = `import React from 'react';

export const X: React.FC = () => {
	return <div />;
};
`;

test('duplicateJsxNode wraps sole return JSX in a fragment with two elements', async () => {
	const {output} = await duplicateJsxNode({
		input: onlyReturn,
		nodePath: lineColumnToNodePath(onlyReturn, 4),
	});

	expect(output).toMatch(/return\s*\(?\s*</);
	const divOpens = output.match(/<div/g);
	expect(divOpens?.length).toBe(2);
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

test('duplicateJsxNode duplicates JSX inside map callback', async () => {
	const {output} = await duplicateJsxNode({
		input: mapCase,
		nodePath: lineColumnToNodePath(mapCase, 7),
	});

	const divOpens = output.match(/<div/g);
	expect(divOpens?.length).toBe(2);
});

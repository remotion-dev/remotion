import {expect, test} from 'bun:test';
import {deleteJsxNode, deleteJsxNodes} from '../codemods/delete-jsx-node';
import {lineColumnToNodePath} from './test-utils';

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

test('deleteJsxNode removes a JSX child from a parent element', async () => {
	const {output} = await deleteJsxNode({
		input: sample,
		nodePath: lineColumnToNodePath(sample, 7),
	});

	expect(output).not.toContain('<div');
	expect(output).toContain('<AbsoluteFill>');
});

const onlyReturn = `import React from 'react';

export const X: React.FC = () => {
	return <div />;
};
`;

test('deleteJsxNode replaces sole return JSX with null', async () => {
	const {output} = await deleteJsxNode({
		input: onlyReturn,
		nodePath: lineColumnToNodePath(onlyReturn, 4),
	});

	expect(output).toContain('return null');
	expect(output).not.toContain('<div');
});

const conditional = `import React from 'react';

export const X: React.FC<{show: boolean}> = ({show}) => {
	return <>{show && <div />}</>;
};
`;

test('deleteJsxNode turns conditional JSX into null', async () => {
	const {output} = await deleteJsxNode({
		input: conditional,
		nodePath: lineColumnToNodePath(conditional, 4),
	});

	expect(output).toContain('&& null');
	expect(output).not.toContain('<div');
});

const ternary = `import React from 'react';

export const X: React.FC<{show: boolean}> = ({show}) => {
	return <>{show ? <div /> : null}</>;
};
`;

test('deleteJsxNode replaces JSX in ternary consequent with null', async () => {
	const {output} = await deleteJsxNode({
		input: ternary,
		nodePath: lineColumnToNodePath(ternary, 4),
	});

	expect(output).toMatch(/\?\s*null/);
	expect(output).not.toContain('<div');
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

test('deleteJsxNode replaces JSX inside map callback', async () => {
	const {output} = await deleteJsxNode({
		input: mapCase,
		nodePath: lineColumnToNodePath(mapCase, 7),
	});

	expect(output).not.toContain('<div');
	expect(output).toMatch(/=>\s*\(?\s*null/);
});

const multipleSiblings = `import React from 'react';
import {AbsoluteFill} from 'remotion';

export const X: React.FC = () => {
	return (
		<AbsoluteFill>
			<div />
			<span />
			<p />
		</AbsoluteFill>
	);
};
`;

test('deleteJsxNodes removes multiple JSX children in one transform', async () => {
	const {output, nodeLabels, logLines} = await deleteJsxNodes({
		input: multipleSiblings,
		nodePaths: [
			lineColumnToNodePath(multipleSiblings, 7),
			lineColumnToNodePath(multipleSiblings, 8),
		],
	});

	expect(output).not.toContain('<div');
	expect(output).not.toContain('<span');
	expect(output).toContain('<p');
	expect(nodeLabels).toEqual(['<div>', '<span>']);
	expect(logLines).toEqual([7, 8]);
});

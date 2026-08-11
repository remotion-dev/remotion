import {expect, test} from 'bun:test';
import {parseAst} from '../codemods/parse-ast';
import {findJsxElementAtNodePath} from '../preview-server/routes/can-update-sequence-props';
import {lineColumnToNodePath} from './test-utils';

const getLine = (input: string, needle: string): number => {
	const lineIndex = input
		.split('\n')
		.findIndex((line) => line.includes(needle));
	if (lineIndex === -1) {
		throw new Error(`Could not find line containing ${needle}`);
	}

	return lineIndex + 1;
};

const withoutFrameHook = `import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

export const Comp: React.FC = () => {
	return (
		<AbsoluteFill>
			<Sequence>
				<div />
			</Sequence>
		</AbsoluteFill>
	);
};
`;

const expectSequenceAtNodePath = (
	input: string,
	nodePath: Parameters<typeof findJsxElementAtNodePath>[1],
) => {
	const element = findJsxElementAtNodePath(parseAst(input), nodePath);
	if (element?.name.type !== 'JSXIdentifier') {
		throw new Error('Expected a JSX identifier');
	}

	expect(element.name.name).toBe('Sequence');
};

test('node paths ignore inserted useCurrentFrame declarations', () => {
	const withFrameHook = withoutFrameHook
		.replace(
			"import {AbsoluteFill, Sequence} from 'remotion';",
			"import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';",
		)
		.replace('return (', 'const frame = useCurrentFrame();\n\treturn (');

	const nodePath = lineColumnToNodePath(
		withoutFrameHook,
		getLine(withoutFrameHook, '<Sequence'),
	);
	const nodePathWithHook = lineColumnToNodePath(
		withFrameHook,
		getLine(withFrameHook, '<Sequence'),
	);

	expect(nodePathWithHook).toEqual(nodePath);
	expectSequenceAtNodePath(withFrameHook, nodePath);
});

test('node paths ignore aliased useCurrentFrame declarations', () => {
	const withAliasedFrameHook = withoutFrameHook
		.replace(
			"import {AbsoluteFill, Sequence} from 'remotion';",
			"import {AbsoluteFill, Sequence, useCurrentFrame as useFrame} from 'remotion';",
		)
		.replace('return (', 'const frame = useFrame();\n\treturn (');

	const nodePath = lineColumnToNodePath(
		withoutFrameHook,
		getLine(withoutFrameHook, '<Sequence'),
	);
	const nodePathWithHook = lineColumnToNodePath(
		withAliasedFrameHook,
		getLine(withAliasedFrameHook, '<Sequence'),
	);

	expect(nodePathWithHook).toEqual(nodePath);
	expectSequenceAtNodePath(withAliasedFrameHook, nodePath);
});

import {expect, test} from 'bun:test';
import {deleteNodes} from '../delete-jsx-nodes-internal';
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

test('deleteNodes removes a JSX child from a parent element', async () => {
	const {output} = await deleteNodes({
		input: sample,
		nodePaths: [lineColumnToNodePath(sample, 7)],
	});

	expect(output).not.toContain('<div');
	expect(output).toContain('<AbsoluteFill>');
});

const onlyReturn = `import React from 'react';

export const X: React.FC = () => {
	return <div />;
};
`;

test('deleteNodes replaces sole return JSX with null', async () => {
	const {output} = await deleteNodes({
		input: onlyReturn,
		nodePaths: [lineColumnToNodePath(onlyReturn, 4)],
	});

	expect(output).toContain('return null');
	expect(output).not.toContain('<div');
});

const conditional = `import React from 'react';

export const X: React.FC<{show: boolean}> = ({show}) => {
	return <>{show && <div />}</>;
};
`;

test('deleteNodes turns conditional JSX into null', async () => {
	const {output} = await deleteNodes({
		input: conditional,
		nodePaths: [lineColumnToNodePath(conditional, 4)],
	});

	expect(output).toContain('&& null');
	expect(output).not.toContain('<div');
});

const ternary = `import React from 'react';

export const X: React.FC<{show: boolean}> = ({show}) => {
	return <>{show ? <div /> : null}</>;
};
`;

test('deleteNodes replaces JSX in ternary consequent with null', async () => {
	const {output} = await deleteNodes({
		input: ternary,
		nodePaths: [lineColumnToNodePath(ternary, 4)],
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

test('deleteNodes replaces JSX inside map callback', async () => {
	const {output} = await deleteNodes({
		input: mapCase,
		nodePaths: [lineColumnToNodePath(mapCase, 7)],
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

test('deleteNodes removes multiple JSX children in one transform', async () => {
	const {output, nodeLabels, logLines} = await deleteNodes({
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

test('deleteNodes preserves source formatting and removes standalone JSX lines', async () => {
	const cases = [
		{
			input: `export const Comp = () => {
	return (
		<div>
			<Keep />
			<RemoveOne />
			<RemoveTwo />
			<Keep />
		</div>
	);
};
`,
			markers: ['<RemoveOne', '<RemoveTwo'],
			expected: `export const Comp = () => {
	return (
		<div>
			<Keep />
			<Keep />
		</div>
	);
};
`,
		},
		{
			input: `export const Comp = () => {
  return (
    <div>
      <Remove />
    </div>
  )
}
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => {
  return (
    <div>
    </div>
  )
}
`,
		},
		{
			input: `export const Comp = () => {
	return [1].map((item) => (
		<Remove key={item} />
	));
};
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => {
	return [1].map((item) => null);
};
`,
		},
		{
			input: `const AnimatedBar = () => {
	return (
		<Remove />
	);
};
`,
			markers: ['<Remove'],
			expected: `const AnimatedBar = () => {
	return null;
};
`,
		},
		{
			input: `const AnimatedBar = () => {
	return (
		// Keep this explanation.
		<Remove />
	);
};
`,
			markers: ['<Remove'],
			expected: `const AnimatedBar = () => {
	return (
		// Keep this explanation.
		null
	);
};
`,
		},
		{
			input: `export const Comp = () => <div><Keep /><Remove /><Keep /></div>;
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => <div><Keep /><Keep /></div>;
`,
		},
		{
			input:
				'export const Comp = () => <div><Keep />\t<Remove /><Keep /></div>;\n',
			markers: ['<Remove'],
			expected: 'export const Comp = () => <div><Keep />\t<Keep /></div>;\n',
		},
		{
			input: `export const Comp = () => (
	<div>
		<Remove /> {/* keep this comment */}
	</div>
);
`,
			markers: ['<Remove'],
			expected: `export const Comp = () => (
	<div>
		 {/* keep this comment */}
	</div>
);
`,
		},
		{
			input: `export const Comp = () => {
	return (
		<div>
			<RemoveParent>
				<RemoveChild />
			</RemoveParent>
			<Keep />
		</div>
	);
};
`,
			markers: ['<RemoveParent', '<RemoveChild'],
			expected: `export const Comp = () => {
	return (
		<div>
			<Keep />
		</div>
	);
};
`,
		},
		{
			input:
				'export const Comp = () => {\r\n\treturn (\r\n\t\t<div>\r\n\t\t\t<Remove />\r\n\t\t</div>\r\n\t);\r\n};\r\n',
			markers: ['<Remove'],
			expected:
				'export const Comp = () => {\r\n\treturn (\r\n\t\t<div>\r\n\t\t</div>\r\n\t);\r\n};\r\n',
		},
	] as const;

	for (const item of cases) {
		const {output, formatted} = await deleteNodes({
			input: item.input,
			nodePaths: item.markers.map((marker) =>
				lineContainingToNodePath(item.input, marker),
			),
		});

		expect(output).toBe(item.expected);
		expect(formatted).toBe(true);
	}
});

const transitionSeries = `import React from 'react';
import {TransitionSeries} from '@remotion/transitions';

export const X: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={61}>
				<div>one</div>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={20}>
				<div>first overlay</div>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={62}>
				<div>two</div>
			</TransitionSeries.Sequence>
			<TransitionSeries.Overlay durationInFrames={30}>
				<div>second overlay</div>
			</TransitionSeries.Overlay>
			<TransitionSeries.Sequence durationInFrames={63}>
				<div>three</div>
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
`;

test('deleteNodes removes the following overlay with a TransitionSeries sequence', async () => {
	const {output, nodeLabels} = await deleteNodes({
		input: transitionSeries,
		nodePaths: [
			lineContainingToNodePath(transitionSeries, 'durationInFrames={62}'),
		],
	});

	expect(output).not.toContain('two');
	expect(output).not.toContain('second overlay');
	expect(output).toContain('first overlay');
	expect(output).toContain('one');
	expect(output).toContain('three');
	expect(nodeLabels).toEqual([
		'<TransitionSeries.Sequence>',
		'<TransitionSeries.Overlay>',
	]);
});

test('deleteNodes removes the preceding overlay with the last TransitionSeries sequence', async () => {
	const {output} = await deleteNodes({
		input: transitionSeries,
		nodePaths: [
			lineContainingToNodePath(transitionSeries, 'durationInFrames={63}'),
		],
	});

	expect(output).not.toContain('three');
	expect(output).not.toContain('second overlay');
	expect(output).toContain('first overlay');
	expect(output).toContain('two');
});

test('deleteNodes removes the following overlay with the first TransitionSeries sequence', async () => {
	const {output} = await deleteNodes({
		input: transitionSeries,
		nodePaths: [
			lineContainingToNodePath(transitionSeries, 'durationInFrames={61}'),
		],
	});

	expect(output).not.toContain('one');
	expect(output).not.toContain('first overlay');
	expect(output).toContain('two');
	expect(output).toContain('second overlay');
	expect(output).toContain('three');
});

test('deleteNodes removes the following transition with a TransitionSeries sequence', async () => {
	const input = transitionSeries.replaceAll(
		'TransitionSeries.Overlay',
		'TransitionSeries.Transition',
	);
	const {output} = await deleteNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'durationInFrames={61}')],
	});

	expect(output).not.toContain('one');
	expect(output).not.toContain('first overlay');
	expect(output).toContain('second overlay');
	expect(output).toContain('two');
});

test('deleteNodes does not remove a connector twice when it is selected too', async () => {
	const {output, nodeLabels} = await deleteNodes({
		input: transitionSeries,
		nodePaths: [
			lineContainingToNodePath(transitionSeries, 'durationInFrames={62}'),
			lineContainingToNodePath(transitionSeries, 'durationInFrames={30}'),
		],
	});

	expect(output).not.toContain('two');
	expect(output).not.toContain('second overlay');
	expect(output).toContain('first overlay');
	expect(nodeLabels).toHaveLength(2);
});

test('deleteNodes keeps the other overlay when the preceding one is selected with the sequence', async () => {
	const {output, nodeLabels} = await deleteNodes({
		input: transitionSeries,
		nodePaths: [
			lineContainingToNodePath(transitionSeries, 'durationInFrames={20}'),
			lineContainingToNodePath(transitionSeries, 'durationInFrames={62}'),
		],
	});

	expect(output).not.toContain('first overlay');
	expect(output).not.toContain('two');
	expect(output).toContain('one');
	expect(output).toContain('second overlay');
	expect(output).toContain('three');
	expect(nodeLabels).toHaveLength(2);
});

test('deleteNodes removes both overlays when the last two TransitionSeries sequences are deleted', async () => {
	const {output} = await deleteNodes({
		input: transitionSeries,
		nodePaths: [
			lineContainingToNodePath(transitionSeries, 'durationInFrames={62}'),
			lineContainingToNodePath(transitionSeries, 'durationInFrames={63}'),
		],
	});

	expect(output).toContain('one');
	expect(output).not.toContain('first overlay');
	expect(output).not.toContain('two');
	expect(output).not.toContain('second overlay');
	expect(output).not.toContain('three');
});

test('deleteNodes keeps the preceding overlay when a plain sequence follows the deleted one', async () => {
	const input = transitionSeries.replace(
		`			<TransitionSeries.Overlay durationInFrames={30}>
				<div>second overlay</div>
			</TransitionSeries.Overlay>
`,
		'',
	);
	const {output} = await deleteNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'durationInFrames={62}')],
	});

	expect(output).not.toContain('two');
	expect(output).toContain('one');
	expect(output).toContain('first overlay');
	expect(output).toContain('three');
});

test('deleteNodes looks past a comment between a TransitionSeries sequence and its overlay', async () => {
	const input = transitionSeries.replace(
		'			<TransitionSeries.Overlay durationInFrames={30}>',
		'			{/* fade to the last scene */}\n			<TransitionSeries.Overlay durationInFrames={30}>',
	);
	const {output} = await deleteNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'durationInFrames={62}')],
	});

	expect(output).not.toContain('two');
	expect(output).not.toContain('second overlay');
	expect(output).toContain('first overlay');
});

test('deleteNodes removes an exit transition when its only sequence is deleted', async () => {
	const input = `import React from 'react';
import {TransitionSeries} from '@remotion/transitions';

export const X: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Transition durationInFrames={10} />
			<TransitionSeries.Sequence durationInFrames={61}>
				<div>one</div>
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition durationInFrames={20} />
		</TransitionSeries>
	);
};
`;
	const {output, nodeLabels} = await deleteNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'durationInFrames={61}')],
	});

	expect(output).not.toContain('one');
	expect(output).not.toContain('TransitionSeries.Transition');
	expect(nodeLabels).toHaveLength(3);
});

test('deleteNodes handles an aliased TransitionSeries import', async () => {
	const input = transitionSeries
		.replace(
			"import {TransitionSeries} from '@remotion/transitions';",
			"import {TransitionSeries as TS} from '@remotion/transitions';",
		)
		.replaceAll('TransitionSeries.', 'TS.')
		.replaceAll('<TransitionSeries>', '<TS>')
		.replaceAll('</TransitionSeries>', '</TS>');
	const {output, nodeLabels} = await deleteNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'durationInFrames={62}')],
	});

	expect(output).not.toContain('two');
	expect(output).not.toContain('second overlay');
	expect(output).toContain('first overlay');
	expect(nodeLabels).toEqual(['<TS.Sequence>', '<TS.Overlay>']);
});

test('deleteNodes handles a namespaced TransitionSeries import', async () => {
	const input = transitionSeries
		.replace(
			"import {TransitionSeries} from '@remotion/transitions';",
			"import * as Transitions from '@remotion/transitions';",
		)
		.replaceAll('TransitionSeries', 'Transitions.TransitionSeries');
	const {output} = await deleteNodes({
		input,
		nodePaths: [lineContainingToNodePath(input, 'durationInFrames={62}')],
	});

	expect(output).not.toContain('two');
	expect(output).not.toContain('second overlay');
	expect(output).toContain('first overlay');
});

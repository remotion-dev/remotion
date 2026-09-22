import {expect, test} from 'bun:test';
import {deleteJsxNodes} from '../delete-jsx-nodes-internal';
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

test('deleteJsxNodes removes a JSX child from a parent element', async () => {
	const {output} = await deleteJsxNodes({
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

test('deleteJsxNodes replaces sole return JSX with null', async () => {
	const {output} = await deleteJsxNodes({
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

test('deleteJsxNodes turns conditional JSX into null', async () => {
	const {output} = await deleteJsxNodes({
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

test('deleteJsxNodes replaces JSX in ternary consequent with null', async () => {
	const {output} = await deleteJsxNodes({
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

test('deleteJsxNodes replaces JSX inside map callback', async () => {
	const {output} = await deleteJsxNodes({
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

test('deleteJsxNodes preserves source formatting and removes standalone JSX lines', async () => {
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
		const {output, formatted} = await deleteJsxNodes({
			input: item.input,
			nodePaths: item.markers.map((marker) =>
				lineContainingToNodePath(item.input, marker),
			),
		});

		expect(output).toBe(item.expected);
		expect(formatted).toBe(true);
	}
});

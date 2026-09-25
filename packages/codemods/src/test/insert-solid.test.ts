import {expect, test} from 'bun:test';
import {addElement, applyCodemodChanges, createElement} from '../index';
import {insertJsxElementIntoProjectWithNodePathRemappings} from '../insert-jsx-element';

const solid = createElement({
	component: 'Solid',
	importPath: 'remotion',
	props: {width: 1280, height: 720, color: 'gray'},
});

test('inserts a Solid into a component source file', () => {
	const project = {
		rootDir: '/',
		files: {
			'src/index.tsx': `import {AbsoluteFill, Composition} from 'remotion';

export const MyComposition = () => <AbsoluteFill>Existing</AbsoluteFill>;
export const Root = () => <Composition id="MyComp" component={MyComposition} />;
`,
		},
	};
	const result = addElement({
		project,
		element: solid,
		target: {
			type: 'composition',
			compositionFile: 'src/index.tsx',
			compositionId: 'MyComp',
		},
	});
	const output = applyCodemodChanges(project, result.changes).files[
		'src/index.tsx'
	];

	expect(output).toContain(
		"import {AbsoluteFill, Composition, Solid} from 'remotion';",
	);
	expect(output).toContain('<Solid width={1280} height={720} color="gray" />');
	expect(result.insertedNode.filePath).toBe('src/index.tsx');
});

test('inserts a timeline Solid in a positioned Sequence', () => {
	const project = {
		rootDir: '/',
		files: {
			'src/index.tsx': `import {Composition} from 'remotion';
export const MyComposition = () => null;
export const Root = () => <Composition id="MyComp" component={MyComposition} />;
`,
		},
	};
	const sequence = createElement({
		component: 'Sequence',
		importPath: 'remotion',
		props: {from: 42, style: {position: 'absolute', translate: '120.3px 80px'}},
	}).withChild(solid);
	const result = addElement({
		project,
		element: sequence,
		target: {
			type: 'composition',
			compositionFile: 'src/index.tsx',
			compositionId: 'MyComp',
		},
	});
	const output = applyCodemodChanges(project, result.changes).files[
		'src/index.tsx'
	];

	expect(output).toContain(
		"import {Composition, Sequence, Solid} from 'remotion';",
	);
	expect(output).toContain('<Sequence');
	expect(output).toContain('from={42}');
	expect(output).toContain("translate: '120.3px 80px'");
	expect(output).toContain('<Solid width={1280} height={720} color="gray" />');
	expect(output.indexOf('<Sequence')).toBeLessThan(output.indexOf('<Solid'));
	expect(
		result.nodePathRemappings.filter((entry) => entry.oldNodePath === null),
	).toHaveLength(2);
});

test('inserts a Solid as a sibling of a component root', () => {
	const project = {
		rootDir: '/',
		files: {
			'src/index.tsx': `import {Composition} from 'remotion';
export const MyComposition = () => (
	<MapViewport>
		<MapRegion />
	</MapViewport>
);
export const Root = () => <Composition id="MyComp" component={MyComposition} />;
`,
		},
	};
	const result = addElement({
		project,
		element: solid,
		target: {
			type: 'composition',
			compositionFile: 'src/index.tsx',
			compositionId: 'MyComp',
		},
	});
	const output = applyCodemodChanges(project, result.changes).files[
		'src/index.tsx'
	];

	const rootEnd = output.indexOf('</MapViewport>');
	const solidStart = output.indexOf('<Solid');
	expect(output).toContain('<>');
	expect(rootEnd).toBeGreaterThan(-1);
	expect(solidStart).toBeGreaterThan(rootEnd);
});

test('the Add Solid insertion preserves source formatting without calling Prettier', async () => {
	const source = `import {Composition, AbsoluteFill} from 'remotion';

// Keep the deliberately non-Prettier formatting in this file.
export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <div>Existing</div>
    </AbsoluteFill>
  )
}

export const Root = () => <Composition id = "MyComp" component={MyComposition}/>;
`;
	const result = await insertJsxElementIntoProjectWithNodePathRemappings({
		project: {
			files: {'/project/src/index.tsx': source},
			rootDir: '/project',
		},
		request: {
			compositionFile: '/project/src/index.tsx',
			compositionId: 'MyComp',
			element: {
				height: 720,
				position: null,
				type: 'solid',
				width: 1280,
			},
			from: null,
		},
		svgMarkupToJsx: () => {
			throw new Error(
				'SVG conversion should not be called when inserting a Solid',
			);
		},
		wrapInSequence: null,
	});

	expect(result.output)
		.toBe(`import {Composition, AbsoluteFill, Solid} from 'remotion';

// Keep the deliberately non-Prettier formatting in this file.
export const MyComposition = () => {
  return (
    <>
      <AbsoluteFill>
        <div>Existing</div>
      </AbsoluteFill>
      <Solid
        width={1280}
        height={720}
        color="gray"
        style={{ position: "absolute" }}
      />
    </>
  )
}

export const Root = () => <Composition id = "MyComp" component={MyComposition}/>;
`);
	expect(result.insertedNodePath).not.toBeNull();
});

test('asset and component insertions also avoid the full-file formatter', async () => {
	const source = `import {Composition, AbsoluteFill} from 'remotion';

export const MyComposition = () => <><AbsoluteFill /></>;
export const Root = () => <Composition id="MyComp" component={MyComposition}/>;
`;
	const assetResult = await insertJsxElementIntoProjectWithNodePathRemappings({
		project: {
			files: {'/project/src/index.tsx': source},
			rootDir: '/project',
		},
		request: {
			compositionFile: '/project/src/index.tsx',
			compositionId: 'MyComp',
			element: {
				assetType: 'image',
				dimensions: {height: 720, width: 1280},
				durationInFrames: null,
				position: null,
				src: 'image.png',
				srcType: 'static',
				type: 'asset',
			},
			from: null,
		},
		svgMarkupToJsx: () => {
			throw new Error('SVG conversion should not be called');
		},
		wrapInSequence: null,
	});
	const componentResult =
		await insertJsxElementIntoProjectWithNodePathRemappings({
			project: {
				files: {'/project/src/index.tsx': source},
				rootDir: '/project',
			},
			request: {
				compositionFile: '/project/src/index.tsx',
				compositionId: 'MyComp',
				element: {
					componentName: 'Chart',
					importName: 'Chart',
					importPath: './Chart',
					position: null,
					props: [{name: 'title', value: 'Revenue'}],
					type: 'component',
				},
				from: null,
			},
			svgMarkupToJsx: () => {
				throw new Error('SVG conversion should not be called');
			},
			wrapInSequence: null,
		});

	expect(assetResult.output).toContain('<CanvasImage\n');
	expect(componentResult.output).toContain('<Chart\n');
	expect(componentResult.output).toContain('title="Revenue"');
});

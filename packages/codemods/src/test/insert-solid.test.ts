import {expect, test} from 'bun:test';
import {addElement, applyCodemodChanges, createElement} from '../index';
import {insertJsxElementIntoProjectWithNodePathRemappings} from '../insert-jsx-element';
import {createElementFromInsertable} from '../insertable-element';

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
	const project = {
		files: {'/project/src/index.tsx': source},
		rootDir: '/project',
	};
	const result = addElement({
		project,
		element: createElementFromInsertable({
			element: {height: 720, position: null, type: 'solid', width: 1280},
			from: null,
			wrapInSequence: null,
		}),
		target: {
			type: 'composition',
			compositionFile: '/project/src/index.tsx',
			compositionId: 'MyComp',
		},
	});

	expect(
		applyCodemodChanges(project, result.changes).files[
			'/project/src/index.tsx'
		],
	).toBe(`import {Composition, AbsoluteFill, Solid} from 'remotion';

// Keep the deliberately non-Prettier formatting in this file.
export const MyComposition = () => {
  return (
    <>
      <AbsoluteFill>
        <div>Existing</div>
      </AbsoluteFill>
      <Solid width={1280} height={720} color="gray" style={{position: 'absolute'}} />
    </>
  )
}

export const Root = () => <Composition id = "MyComp" component={MyComposition}/>;
`);
	expect(result.insertedNode.nodePath.length).toBeGreaterThan(0);
	await expect(
		insertJsxElementIntoProjectWithNodePathRemappings({
			project,
			request: {
				compositionFile: '/project/src/index.tsx',
				compositionId: 'MyComp',
				element: {height: 720, position: null, type: 'solid', width: 1280},
				from: null,
			},
			svgMarkupToJsx: () => {
				throw new Error('SVG conversion should not be called');
			},
			wrapInSequence: null,
		}),
	).rejects.toThrow('addElement()');
});

test('asset and component insertions also avoid the full-file formatter', () => {
	const source = `import {Composition, AbsoluteFill} from 'remotion';

export const MyComposition = () => <><AbsoluteFill /></>;
export const Root = () => <Composition id="MyComp" component={MyComposition}/>;
`;
	const project = {
		files: {'/project/src/index.tsx': source},
		rootDir: '/project',
	};
	const target = {
		type: 'composition' as const,
		compositionFile: '/project/src/index.tsx',
		compositionId: 'MyComp',
	};
	const assetResult = addElement({
		project,
		element: createElementFromInsertable({
			element: {
				assetType: 'image',
				dimensions: {height: 720, width: 1280},
				durationInFrames: null,
				position: {x: 10, y: 20.25},
				src: 'image.png',
				srcType: 'static',
				type: 'asset',
			},
			from: null,
			wrapInSequence: null,
		}),
		target,
	});
	const componentResult = addElement({
		project,
		element: createElementFromInsertable({
			element: {
				componentName: 'RevenueChart',
				importName: 'Chart',
				importPath: './Chart',
				position: null,
				props: [
					{name: 'title', value: 'Revenue'},
					{name: 'style', value: {position: 'relative', opacity: 0.5} as never},
				],
				type: 'component',
			},
			from: 12,
			wrapInSequence: {
				dimensions: {width: 400, height: 300},
				durationInFrames: 60,
				from: 12,
				name: 'Chart',
				position: {x: 1, y: 2},
			},
		}),
		target,
	});
	const assetOutput = applyCodemodChanges(project, assetResult.changes).files[
		'/project/src/index.tsx'
	];
	const componentOutput = applyCodemodChanges(project, componentResult.changes)
		.files['/project/src/index.tsx'];

	expect(assetOutput).toContain(
		"import {Composition, AbsoluteFill, CanvasImage, staticFile} from 'remotion';",
	);
	expect(assetOutput).toContain('<CanvasImage\n');
	expect(assetOutput).toContain("src={staticFile('image.png')}");
	// Too long for one line, so the style object keeps its expanded layout.
	expect(assetOutput).toMatch(
		/style=\{\{\n\s+position: 'absolute',\n\s+translate: '10px 20\.3px',\n\s+width: 1280,\n\s+height: 720\n\s+\}\}/,
	);
	expect(componentOutput).toContain(
		"import {Chart as RevenueChart} from './Chart';",
	);
	expect(componentOutput).toContain(
		`<Sequence\n    from={12}\n    name="Chart"\n    width={400}\n    height={300}\n    durationInFrames={60}\n    style={{position: 'absolute', translate: '1px 2px'}}\n  >`,
	);
	expect(componentOutput).toContain(
		`<RevenueChart\n      title="Revenue"\n      style={{position: 'relative', opacity: 0.5}}\n      from={12}\n    />`,
	);
});

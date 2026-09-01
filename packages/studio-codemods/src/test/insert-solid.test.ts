import {expect, test} from 'bun:test';
import {
	insertJsxElementIntoProjectWithNodePathRemappings,
	insertSolidIntoSource,
} from '..';

test('inserts a Solid into a component source file', () => {
	const result = insertSolidIntoSource({
		exportName: 'MyComposition',
		height: 720,
		position: null,
		source: `import {AbsoluteFill} from 'remotion';

export const MyComposition = () => <AbsoluteFill>Existing</AbsoluteFill>;
`,
		width: 1280,
	});

	expect(result.output).toContain(
		"import {AbsoluteFill, Solid} from 'remotion';",
	);
	expect(result.output).toContain(
		'<Solid width={1280} height={720} color="gray"',
	);
	expect(result.line).toBe(3);
});

test('inserts a timeline Solid in a positioned Sequence', () => {
	const result = insertSolidIntoSource({
		exportName: 'MyComposition',
		from: 42,
		height: 720,
		position: {x: 120.25, y: 80},
		source: `export const MyComposition = () => null;\n`,
		width: 1280,
	});

	expect(result.output).toContain("import {Solid, Sequence} from 'remotion';");
	expect(result.output).toContain('<Sequence from={42}');
	expect(result.output).toContain("translate: '120.3px 80px'");
	expect(result.output).toContain('<Solid width={1280} height={720}');
});

test('inserts a Solid as a sibling of a component root', () => {
	const result = insertSolidIntoSource({
		exportName: 'MyComposition',
		height: 720,
		position: null,
		source: `export const MyComposition = () => (
	<MapViewport>
		<MapRegion />
	</MapViewport>
);
`,
		width: 1280,
	});

	const rootEnd = result.output.indexOf('</MapViewport>');
	const solidStart = result.output.indexOf('<Solid');
	expect(result.output).toContain('<>');
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

	expect(result.project.files['/project/src/index.tsx'])
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

	expect(assetResult.project.files['/project/src/index.tsx']).toContain(
		'<CanvasImage\n',
	);
	expect(componentResult.project.files['/project/src/index.tsx']).toContain(
		'<Chart\n',
	);
	expect(componentResult.project.files['/project/src/index.tsx']).toContain(
		'title="Revenue"',
	);
});

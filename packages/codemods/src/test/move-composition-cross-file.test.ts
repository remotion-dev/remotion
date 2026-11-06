import {expect, test} from 'bun:test';
import {applyCodemodChanges} from '../codemod-project';
import {moveComposition} from '../move-composition';

const destination = {
	type: 'folder' as const,
	folder: {name: 'Target', parentName: null},
};

for (const tag of ['Composition', 'Still'] as const) {
	test(`moves an imported ${tag} registration into another file`, () => {
		const sourceFile = 'src/Root.tsx';
		const targetFile = 'src/folders/Target.tsx';
		const source = `import {${tag}} from 'remotion';
import {Scene} from './scenes/Scene';
const untouched  =  { value : "keep" };
export const Root = () => (
  <>
    <${tag} id="Move" component={Scene} defaultProps={{label: 'keep'}} width={1920} />
    <${tag} id="Keep" component={Scene} />
  </>
);
`;
		const target = `import {Folder} from 'remotion';
export const Registrations = () => <Folder name="Target" />;
`;
		const project = {
			rootDir: '/',
			files: {[sourceFile]: source, [targetFile]: target},
		};
		const result = moveComposition({
			project,
			compositionFile: sourceFile,
			compositionId: 'Move',
			destination,
		});
		const updated = applyCodemodChanges(project, result.changes);
		expect(result.changes).toHaveLength(2);
		expect(updated.files[sourceFile]).not.toContain('id="Move"');
		expect(updated.files[sourceFile]).toContain('id="Keep"');
		expect(updated.files[sourceFile]).toContain(
			'const untouched  =  { value : "keep" };',
		);
		expect(updated.files[targetFile]).toContain(
			`import {Scene} from '../scenes/Scene';`,
		);
		expect(updated.files[targetFile]).toContain(
			`<${tag} id="Move" component={Scene} defaultProps={{label: 'keep'}} width={1920} />`,
		);
		expect(result.updatedNode.filePath).toBe(targetFile);
		expect(
			result.nodePathRemappings.some(
				(entry) => entry.filePath === sourceFile && entry.newNodePath === null,
			),
		).toBe(true);
		expect(
			result.nodePathRemappings.some(
				(entry) => entry.filePath === targetFile && entry.oldNodePath === null,
			),
		).toBe(true);
		expect(project.files).toEqual({[sourceFile]: source, [targetFile]: target});
	});
}

test('rebases dependencies and preserves shorthand keys when an imported name collides', () => {
	const project = {
		rootDir: '/',
		files: {
			'src/Root.tsx': `import {Still as Shot} from 'remotion';
import Scene from './Scene';
import {defaults} from './settings';
export const Root = () => <><Shot id="Move" component={Scene} defaultProps={{Scene, defaults, literal: 'Scene'}} /></>;
`,
			'src/folders/Target.tsx': `import {Folder, Still as Picture} from 'remotion';
const Scene = 'do not capture this';
export const Registrations = () => {
  const Picture = 'shadowed import';
  return <Folder name="Target" />;
};
`,
		},
	};
	const result = moveComposition({
		project,
		compositionFile: 'src/Root.tsx',
		compositionId: 'Move',
		destination,
	});
	const updated = applyCodemodChanges(project, result.changes);
	const target = updated.files['src/folders/Target.tsx'];
	expect(target).toContain("from '../Scene'");
	expect(target).toContain("from '../settings'");
	expect(target).toContain('Scene: Scene2');
	expect(target).toContain("literal: 'Scene'");
	expect(target).not.toContain('<Picture id="Move"');
	expect(updated.files['src/Root.tsx']).not.toContain("from './Scene'");
});

test('refuses local dependencies without changing either file', () => {
	const project = {
		rootDir: '/',
		files: {
			'Root.tsx': `import {Still} from 'remotion';
import {Scene} from './Scene';
export const Root = () => { const width = 100; return <><Still id="Move" component={Scene} width={width} /></>; };`,
			'Target.tsx': `import {Folder} from 'remotion'; export const Target = () => <Folder name="Target" />;`,
		},
	};
	const original = JSON.stringify(project);
	expect(() =>
		moveComposition({
			project,
			compositionFile: 'Root.tsx',
			compositionId: 'Move',
			destination,
		}),
	).toThrow(/width.*(?:local|import|depend)|(?:local|import|depend).*width/i);
	expect(JSON.stringify(project)).toBe(original);
});

test('rejects ambiguous destination folders across files', () => {
	const project = {
		rootDir: '/',
		files: {
			'Root.tsx': `import {Still} from 'remotion'; import {Scene} from './Scene'; export const Root = () => <><Still id="Move" component={Scene} /></>;`,
			'Target.tsx': `import {Folder} from 'remotion'; export const Target = () => <Folder name="Target" />;`,
			'Other.tsx': `import {Folder} from 'remotion'; export const Other = () => <Folder name="Target" />;`,
		},
	};
	expect(() =>
		moveComposition({
			project,
			compositionFile: 'Root.tsx',
			compositionId: 'Move',
			destination,
		}),
	).toThrow(/found 2/);
});

for (const [sourceFile, targetFile, expectedImport] of [
	['src/Root.tsx', 'Target.tsx', './src/Scene'],
	['/project/src/Root.tsx', '/project/Target.tsx', './src/Scene'],
	['C:\\project\\src\\Root.tsx', 'C:\\project\\Target.tsx', './src/Scene'],
	['src/Root.tsx', 'src/deep/Target.tsx', '../Scene'],
]) {
	test(`rebases relative dependencies from ${sourceFile} to ${targetFile}`, () => {
		const project = {
			rootDir: '/',
			files: {
				[sourceFile]: `import {Still} from 'remotion'; import {Scene} from './Scene'; export const Root = () => <><Still id="Move" component={Scene} /></>;`,
				[targetFile]: `import {Folder} from 'remotion'; export const Target = () => <Folder name="Target" />;`,
			},
		};
		const result = moveComposition({
			project,
			compositionFile: sourceFile,
			compositionId: 'Move',
			destination,
		});
		expect(
			applyCodemodChanges(project, result.changes).files[targetFile],
		).toContain(`from '${expectedImport}'`);
	});
}

test('retains namespace imports, reuses an unshadowed tag alias and rebases lazy imports', () => {
	const project = {
		rootDir: '/',
		files: {
			'src/Root.tsx': `import {Still as Shot} from 'remotion'; import * as Config from './config'; export const Root = () => <><Shot id="Move" lazyComponent={() => import('./Scene')} defaultProps={{width: Config.width}} calculateMetadata={({props}) => ({props})} /></>;`,
			'src/folders/Target.tsx': `import {Folder, Still as Snapshot} from 'remotion'; export const Target = () => <Folder name="Target" />;`,
		},
	};
	const result = moveComposition({
		project,
		compositionFile: 'src/Root.tsx',
		compositionId: 'Move',
		destination,
	});
	const output = applyCodemodChanges(project, result.changes).files[
		'src/folders/Target.tsx'
	];
	expect(output).toContain('<Snapshot id="Move"');
	expect(output).toContain("import * as Config from '../config'");
	expect(output).toContain("import('../Scene')");
	expect(output).toContain('calculateMetadata={({props}) => ({props})}');
});

for (const position of ['before', 'after'] as const) {
	test(`moves a composition ${position} a registration in another file`, () => {
		const project = {
			rootDir: '/',
			files: {
				'Root.tsx': `import {Still} from 'remotion'; import {Scene} from './Scene'; export const Root = () => <><Still id="Move" component={Scene} /></>;`,
				'Target.tsx': `import {Still} from 'remotion'; import {Scene} from './Scene'; export const Target = () => <><Still id="Keep" component={Scene} /></>;`,
			},
		};
		const result = moveComposition({
			project,
			compositionFile: 'Root.tsx',
			compositionId: 'Move',
			destination: {
				type: position,
				target: {type: 'composition', compositionId: 'Keep'},
			},
		});
		const output = applyCodemodChanges(project, result.changes).files[
			'Target.tsx'
		];
		expect(output.indexOf('id="Move"') < output.indexOf('id="Keep"')).toBe(
			position === 'before',
		);
		expect(output.match(/import \{Still\}/g)).toHaveLength(1);
	});
}

test('moves imported TypeScript types used in inline callbacks', () => {
	const project = {
		rootDir: '/',
		files: {
			'src/Root.tsx': `import {Still} from 'remotion'; import {Scene} from './Scene'; import type {Props} from './types'; export const Root = () => <><Still id="Move" component={Scene} calculateMetadata={({props}: {props: Props}) => ({props})} /></>;`,
			'src/folders/Target.tsx': `import {Folder} from 'remotion'; export const Target = () => <Folder name="Target" />;`,
		},
	};
	const result = moveComposition({
		project,
		compositionFile: 'src/Root.tsx',
		compositionId: 'Move',
		destination,
	});
	const output = applyCodemodChanges(project, result.changes).files[
		'src/folders/Target.tsx'
	];
	expect(output).toContain("import type {Props} from '../types'");
	expect(output).toContain('({props}: {props: Props}) => ({props})');
});

test('renames a namespace type without treating type members and property keys as bindings', () => {
	const project = {
		rootDir: '/',
		files: {
			'src/Root.tsx': `import {Still} from 'remotion'; import {Scene} from './Scene'; import type * as Types from './types'; export const Root = () => <><Still id="Move" component={Scene} calculateMetadata={({props}: {props: Types.Props; summary?: [title: string]; render?(): Types.Props}) => ({props})} /></>;`,
			'src/folders/Target.tsx': `import {Folder} from 'remotion'; const Types = 'occupied'; export const Target = () => <Folder name="Target" />;`,
		},
	};
	const result = moveComposition({
		project,
		compositionFile: 'src/Root.tsx',
		compositionId: 'Move',
		destination,
	});
	const output = applyCodemodChanges(project, result.changes).files[
		'src/folders/Target.tsx'
	];
	expect(output).toContain("import type * as Types2 from '../types'");
	expect(output).toContain('props: Types2.Props');
	expect(output).toContain('summary?: [title: string]');
	expect(output).toContain('render?(): Types2.Props');
});

test('uses an explicit destination file to disambiguate project folders', () => {
	const project = {
		rootDir: '/',
		files: {
			'Root.tsx': `import {Still} from 'remotion'; import {Scene} from './Scene'; export const Root = () => <><Still id="Move" component={Scene} /></>;`,
			'Target.tsx': `import {Folder} from 'remotion'; export const Target = () => <Folder name="Target" />;`,
			'Other.tsx': `import {Folder} from 'remotion'; export const Other = () => <Folder name="Target" />;`,
		},
	};
	const result = moveComposition({
		project,
		compositionFile: 'Root.tsx',
		compositionId: 'Move',
		destination,
		destinationFile: 'Target.tsx',
	});
	const updated = applyCodemodChanges(project, result.changes);
	expect(updated.files['Other.tsx']).toBe(project.files['Other.tsx']);
	expect(result.updatedNode.filePath).toBe('Target.tsx');
});

for (const [label, imports, declaration, props, diagnostic] of [
	[
		'module local value',
		"import {Scene} from './Scene';",
		'const width = 100;',
		'width={width}',
		/dependency "width"/,
	],
	[
		'import shadowed in source',
		"import {Scene, width} from './Scene';",
		'',
		'width={width}',
		/dependency "width"/,
	],
	[
		'lexical this',
		"import {Scene} from './Scene';",
		'',
		'defaultProps={this.props}',
		/lexical this/,
	],
	[
		'module metadata',
		"import {Scene} from './Scene';",
		'',
		'defaultProps={{url: import.meta.url}}',
		/module-relative/,
	],
	[
		'unknown global',
		"import {Scene} from './Scene';",
		'',
		'width={unknownWidth}',
		/dependency "unknownWidth"/,
	],
	[
		'unresolved alias',
		"import {Scene} from '@/Scene';",
		'',
		'',
		/unresolved import alias/,
	],
	[
		'destination dependency',
		"import {Scene} from './Target';",
		'',
		'',
		/destination file/,
	],
] as const) {
	test(`refuses ${label} atomically`, () => {
		const local =
			label === 'import shadowed in source' ? 'const width = 100;' : '';
		const project = {
			rootDir: '/',
			files: {
				'Root.tsx': `import {Still} from 'remotion'; ${imports} ${declaration} export const Root = () => { ${local} return <><Still id="Move" component={Scene} ${props}/></>; };`,
				'Target.tsx': `import {Folder} from 'remotion'; export const Target = () => <Folder name="Target" />;`,
			},
		};
		const before = JSON.stringify(project);
		expect(() =>
			moveComposition({
				project,
				compositionFile: 'Root.tsx',
				compositionId: 'Move',
				destination,
			}),
		).toThrow(diagnostic);
		expect(JSON.stringify(project)).toBe(before);
	});
}

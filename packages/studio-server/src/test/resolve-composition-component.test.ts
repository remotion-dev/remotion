import {expect, test} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
	insertJsxElementIntoComposition,
	resolveCompositionComponent,
} from '../helpers/resolve-composition-component';

const remotionRoot = path.join(__dirname, '..', '..', '..', 'example');

test('resolves a statically imported composition component', async () => {
	const location = await resolveCompositionComponent({
		remotionRoot,
		compositionFile: 'src/E2eTestRoot.tsx',
		compositionId: 'schema-test',
	});

	expect(location.source).toBe(path.join('src', 'SchemaTest', 'index.tsx'));
	expect(location.line).toBe(142);
	expect(location.canAddSequence).toBe(true);
});

test('resolves a lazy imported composition component', async () => {
	const location = await resolveCompositionComponent({
		remotionRoot,
		compositionFile: 'src/Root.tsx',
		compositionId: 'looped',
	});

	expect(location.source).toBe(path.join('src', 'LoopedVideo', 'index.tsx'));
	expect(location.line).toBe(4);
	expect(location.canAddSequence).toBe(true);
});

test('resolves recursively through re-exported composition components', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './components';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.mkdir(path.join(tempDir, 'components', 'inner'), {
			recursive: true,
		});
		await fs.writeFile(
			path.join(tempDir, 'components', 'index.tsx'),
			["export {MyComp} from './inner';", ''].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'components', 'inner', 'index.tsx'),
			["export {MyComp} from './MyComp';", ''].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'components', 'inner', 'MyComp.tsx'),
			[
				'export const MyComp: React.FC = () => {',
				'\treturn <div>hello</div>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe(
			path.join('components', 'inner', 'MyComp.tsx'),
		);
		expect(location.line).toBe(1);
		expect(location.canAddSequence).toBe(true);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('resolves through fallback re-export branch after cycle', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './components';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.mkdir(path.join(tempDir, 'components', 'valid'), {
			recursive: true,
		});
		await fs.writeFile(
			path.join(tempDir, 'components', 'index.tsx'),
			[
				"export {MyComp} from './cycle-a';",
				"export {MyComp} from './valid';",
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'components', 'cycle-a.tsx'),
			["export {MyComp} from './cycle-b';", ''].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'components', 'cycle-b.tsx'),
			["export {MyComp} from './cycle-a';", ''].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'components', 'valid', 'index.tsx'),
			["export {MyComp} from './MyComp';", ''].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'components', 'valid', 'MyComp.tsx'),
			[
				'export const MyComp: React.FC = () => {',
				'\treturn <div>hello</div>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe(
			path.join('components', 'valid', 'MyComp.tsx'),
		);
		expect(location.line).toBe(1);
		expect(location.canAddSequence).toBe(true);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('resolves a same-file composition component', async () => {
	const location = await resolveCompositionComponent({
		remotionRoot,
		compositionFile: 'src/NewVideo.tsx',
		compositionId: 'NewVideo',
	});

	expect(location.source).toBe(path.join('src', 'NewVideo.tsx'));
	expect(location.line).toBe(21);
	expect(location.canAddSequence).toBe(false);
});

test('bails out if component has no JSX return', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				'export const MyComp: React.FC = () => {',
				'\tthrow new Error("hello");',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(false);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('supports adding a sequence to fragment return', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				'export const MyComp: React.FC = () => {',
				'\treturn <>hello</>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(true);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('supports adding a sequence to JSX element return', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				'export const MyComp: React.FC = () => {',
				'\treturn <div>hello</div>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(true);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('canAddSequence=true for default-exported function component', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import MyComp from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				'const MyComp: React.FC = () => {',
				'\treturn <section>hello</section>;',
				'};',
				'',
				'export default MyComp;',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(true);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('canAddSequence=false for self-closing root JSX return', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				'export const MyComp: React.FC = () => {',
				'\treturn <div />;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(false);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('canAddSequence=false for ThreeCanvas root element', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				"import {ThreeCanvas} from '@remotion/three';",
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <ThreeCanvas></ThreeCanvas>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(false);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('canAddSequence=false for RiveCanvas root element', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				"import {RiveCanvas} from '@remotion/rive';",
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <RiveCanvas></RiveCanvas>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(false);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('canAddSequence=false for SkiaCanvas root element', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				"import {SkiaCanvas} from '@remotion/skia';",
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <SkiaCanvas></SkiaCanvas>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(false);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('canAddSequence=false for plain canvas root element', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				'export const MyComp: React.FC = () => {',
				'\treturn <canvas></canvas>;',
				'};',
				'',
			].join('\n'),
		);

		const location = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(location.source).toBe('MyComp.tsx');
		expect(location.canAddSequence).toBe(false);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a Solid into the resolved composition component', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				"import {AbsoluteFill} from 'remotion';",
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <AbsoluteFill>hello</AbsoluteFill>;',
				'};',
				'',
			].join('\n'),
		);

		const result = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
			element: {
				type: 'solid',
				width: 1280,
				height: 720,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.source).toBe('MyComp.tsx');
		expect(result.output).toContain(
			"import { AbsoluteFill, Solid } from 'remotion';",
		);
		expect(result.output).toContain('<Solid width={1280} height={720} />');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts an aliased Solid import if Solid is already defined', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {MyComp} from './MyComp';",
				'export const RemotionRoot = () => {',
				'\treturn <Composition id="test" component={MyComp} />;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'MyComp.tsx'),
			[
				"import {AbsoluteFill} from 'remotion';",
				'',
				'export const Solid = () => null;',
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <AbsoluteFill>hello</AbsoluteFill>;',
				'};',
				'',
			].join('\n'),
		);

		const result = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
			element: {
				type: 'solid',
				width: 1920,
				height: 1080,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { AbsoluteFill, Solid as RemotionSolid } from 'remotion';",
		);
		expect(result.output).toContain(
			'<RemotionSolid width={1920} height={1080} />',
		);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

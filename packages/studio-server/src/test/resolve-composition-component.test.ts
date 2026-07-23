import {expect, test} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import {
	insertJsxElementIntoComposition,
	resolveCompositionComponent,
} from '../helpers/resolve-composition-component';
import {insertJsxElementHandler} from '../preview-server/routes/insert-jsx-element';

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
	expect(location.canAddSequence).toBe(true);
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

test('canAddSequence=true for self-closing root JSX return', async () => {
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
		expect(location.canAddSequence).toBe(true);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('wraps a self-closing root in a Sequence before inserting', async () => {
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
				"import {Video} from '@remotion/media';",
				"import {staticFile} from 'remotion';",
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <Video src={staticFile("background.mov")} />;',
				'};',
				'',
			].join('\n'),
		);

		const result = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
			element: {
				type: 'asset',
				assetType: 'audio',
				src: 'music.mp3',
				srcType: 'static',
				dimensions: null,
				durationInFrames: null,
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { staticFile, Sequence } from 'remotion';",
		);
		expect(result.output).toContain('<Sequence>');
		expect(result.output).toContain(
			"<Video src={staticFile('background.mov')} />",
		);
		expect(result.output).toContain('</Sequence>');
		expect(result.output).toContain("<Audio src={staticFile('music.mp3')} />");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('removes parentheses when wrapping a self-closing root in a Sequence', async () => {
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
				"import {Video} from '@remotion/media';",
				"import {staticFile} from 'remotion';",
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn (',
				'\t\t<Video src={staticFile("background.mov")} />',
				'\t);',
				'};',
				'',
			].join('\n'),
		);

		const result = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
			element: {
				type: 'asset',
				assetType: 'image',
				src: 'foreground.png',
				srcType: 'static',
				dimensions: {width: 1920, height: 1080},
				durationInFrames: null,
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain('<Sequence>\n\t\t\t\t<Video');
		expect(result.output).not.toContain('<Sequence>\n\t\t\t(');
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
				'\treturn <ThreeCanvas />;',
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
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.source).toBe('MyComp.tsx');
		expect(result.output).toContain(
			"import { AbsoluteFill, Solid } from 'remotion';",
		);
		expect(result.output).toContain('<Solid');
		expect(result.output).toContain('width={1280}');
		expect(result.output).toContain('height={720}');
		expect(result.output).toContain('color="gray"');
		expect(result.output).toContain("position: 'absolute'");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a Solid with a translate style', async () => {
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
				position: {
					x: 120,
					y: 80.5,
				},
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("position: 'absolute'");
		expect(result.output).toContain("translate: '120px 80.5px'");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('rounds the translate style to one decimal place', async () => {
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
				position: {
					x: -366.7533828676237,
					y: 50.1836012801557,
				},
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("position: 'absolute'");
		expect(result.output).toContain("translate: '-366.8px 50.2px'");
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
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { AbsoluteFill, Solid as RemotionSolid } from 'remotion';",
		);
		expect(result.output).toContain('<RemotionSolid');
		expect(result.output).toContain('width={1920}');
		expect(result.output).toContain('height={1080}');
		expect(result.output).toContain("position: 'absolute'");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a Solid into an empty component returning null', async () => {
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
			['export const MyComp: React.FC = () => null;', ''].join('\n'),
		);

		const result = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
			element: {
				type: 'solid',
				width: 640,
				height: 360,
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("import { Solid } from 'remotion';");
		expect(result.output).toContain('export const MyComp: React.FC = () => (');
		expect(result.output).toContain('\t<>');
		expect(result.output).toContain('\t\t<Solid');
		expect(result.output).toContain('\t</>');
		expect(result.output).toContain('width={640}');
		expect(result.output).toContain('height={360}');
		expect(result.output).toContain("position: 'absolute'");

		await fs.writeFile(path.join(tempDir, 'MyComp.tsx'), result.output);

		const afterFirstInsert = await resolveCompositionComponent({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
		});
		expect(afterFirstInsert.canAddSequence).toBe(true);

		const secondInsert = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'test',
			element: {
				type: 'solid',
				width: 320,
				height: 180,
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});
		expect(secondInsert.output.match(/<Solid/g)?.length).toBe(2);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('converts and inserts SVG markup as an Interactive.Svg', async () => {
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
				type: 'svg',
				markup:
					'<svg width="100" height="50" viewBox="0 0 100 50" style="opacity: 0.8"><path fill-rule="evenodd" stroke-width="2" d="M0 0h10v10z" /></svg>',
				position: {x: 120.25, y: 80},
			},
			from: 42,
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { AbsoluteFill, Interactive } from 'remotion';",
		);
		expect(result.output).toContain('<Interactive.Svg');
		expect(result.output).toContain('from={42}');
		expect(result.output).not.toContain('<Sequence');
		expect(result.output).toContain('</Interactive.Svg>');
		expect(result.output).toContain('width={100}');
		expect(result.output).toContain('height={50}');
		expect(result.output).toContain('viewBox="0 0 100 50"');
		expect(result.output).toContain('fillRule="evenodd"');
		expect(result.output).toContain('strokeWidth={2}');
		expect(result.output).toContain('opacity: 0.8');
		expect(result.output).toContain("position: 'absolute'");
		expect(result.output).toContain("translate: '120.3px 80px'");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a CanvasImage asset at a timeline frame', async () => {
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
				type: 'asset',
				assetType: 'image',
				src: 'image.png',
				srcType: 'static',
				dimensions: {
					width: 800,
					height: 600,
				},
				durationInFrames: null,
				position: null,
			},
			from: 42,
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { AbsoluteFill, staticFile, CanvasImage } from 'remotion';",
		);
		expect(result.output).not.toContain('<Sequence');
		expect(result.output).toContain('from={42}');
		expect(result.output).toContain('<CanvasImage');
		expect(result.output).toContain("src={staticFile('image.png')}");
		expect(result.output).toContain("position: 'absolute'");
		expect(result.output).not.toContain('width={800}');
		expect(result.output).not.toContain('height={600}');
		expect(result.output).not.toContain('width: 800');
		expect(result.output).not.toContain('height: 600');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a CanvasImage asset with a translate style', async () => {
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
				type: 'asset',
				assetType: 'image',
				src: 'image.png',
				srcType: 'static',
				dimensions: {
					width: 800,
					height: 600,
				},
				durationInFrames: null,
				position: {
					x: 100,
					y: 150,
				},
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { AbsoluteFill, staticFile, CanvasImage } from 'remotion';",
		);
		expect(result.output).toContain('<CanvasImage');
		expect(result.output).toContain("src={staticFile('image.png')}");
		expect(result.output).toContain("translate: '100px 150px'");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts an AnimatedImage asset into the resolved composition component', async () => {
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
				type: 'asset',
				assetType: 'animated-image',
				src: 'animated-png.png',
				srcType: 'static',
				dimensions: {
					width: 320,
					height: 180,
				},
				durationInFrames: 37.52,
				position: null,
			},
			from: 42,
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { AbsoluteFill, staticFile, AnimatedImage } from 'remotion';",
		);
		expect(result.output).toContain('<AnimatedImage');
		expect(result.output).toContain("src={staticFile('animated-png.png')}");
		expect(result.output).toContain('durationInFrames={37.52}');
		expect(result.output).toContain('from={42}');
		expect(result.output).not.toContain('<Sequence');
		expect(result.output).toContain('width: 320');
		expect(result.output).toContain('height: 180');
		expect(result.output).not.toContain('width={320}');
		expect(result.output).not.toContain('height={180}');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a Video asset with its duration and CSS dimensions', async () => {
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
				type: 'asset',
				assetType: 'video',
				src: 'clip.mp4',
				srcType: 'static',
				dimensions: {
					width: 1920,
					height: 1080,
				},
				durationInFrames: 37.52,
				position: null,
			},
			from: 42,
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("import { Video } from '@remotion/media';");
		expect(result.output).toContain(
			"import { AbsoluteFill, staticFile } from 'remotion';",
		);
		expect(result.output).toContain('durationInFrames={37.52}');
		expect(result.output).toContain('from={42}');
		expect(result.output).toContain('<Video');
		expect(result.output).toContain("src={staticFile('clip.mp4')}");
		expect(result.output).toContain("position: 'absolute'");
		expect(result.output).toContain('width: 1920');
		expect(result.output).toContain('height: 1080');
		expect(result.output).not.toContain('<Sequence');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('rejects inserting a Video asset if Video is already defined', async () => {
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
				'export const Video = () => null;',
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <AbsoluteFill>hello</AbsoluteFill>;',
				'};',
				'',
			].join('\n'),
		);

		await expect(
			insertJsxElementIntoComposition({
				remotionRoot: tempDir,
				compositionFile: 'Root.tsx',
				compositionId: 'test',
				element: {
					type: 'asset',
					assetType: 'video',
					src: 'clip.mp4',
					srcType: 'static',
					dimensions: null,
					durationInFrames: null,
					position: null,
				},
				prettierConfigOverride: {singleQuote: true, useTabs: true},
			}),
		).rejects.toThrow('Cannot add <Video> because Video is already defined');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a Gif asset into the resolved composition component', async () => {
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
				type: 'asset',
				assetType: 'gif',
				src: 'animation.gif',
				srcType: 'static',
				dimensions: {
					width: 320,
					height: 180,
				},
				durationInFrames: 37.52,
				position: null,
			},
			from: 42,
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("import { Gif } from '@remotion/gif';");
		expect(result.output).toContain(
			"import { AbsoluteFill, staticFile } from 'remotion';",
		);
		expect(result.output).toContain('<Gif');
		expect(result.output).toContain("src={staticFile('animation.gif')}");
		expect(result.output).toContain('durationInFrames={37.52}');
		expect(result.output).toContain('from={42}');
		expect(result.output).not.toContain('<Sequence');
		expect(result.output).toContain('width: 320');
		expect(result.output).toContain('height: 180');
		expect(result.output).not.toContain('width={320}');
		expect(result.output).not.toContain('height={180}');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts an Audio asset into the resolved composition component', async () => {
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
				type: 'asset',
				assetType: 'audio',
				src: 'audio.mp3',
				srcType: 'static',
				dimensions: null,
				durationInFrames: 37.52,
				position: null,
			},
			from: 42,
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("import { Audio } from '@remotion/media';");
		expect(result.output).toContain(
			"import { AbsoluteFill, staticFile } from 'remotion';",
		);
		expect(result.output).toContain('<Audio');
		expect(result.output).toContain("src={staticFile('audio.mp3')}");
		expect(result.output).toContain('durationInFrames={37.52}');
		expect(result.output).toContain('from={42}');
		expect(result.output).not.toContain('<Sequence');
		expect(result.output).not.toContain("position: 'absolute'");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a remote audio asset with a literal URL', async () => {
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
				type: 'asset',
				assetType: 'audio',
				src: 'https://example.com/whip.wav',
				srcType: 'remote',
				dimensions: null,
				durationInFrames: null,
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("import { Audio } from '@remotion/media';");
		expect(result.output).toContain("import { AbsoluteFill } from 'remotion';");
		expect(result.output).toContain('<Audio');
		expect(result.output).toContain('src="https://example.com/whip.wav"');
		expect(result.output).not.toContain('staticFile');
		expect(result.output).not.toContain('@remotion/sfx');
		expect(result.output).not.toContain("position: 'absolute'");
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('rejects inserting an Audio asset if Audio is already defined', async () => {
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
				'export const Audio = () => null;',
				'',
				'export const MyComp: React.FC = () => {',
				'\treturn <AbsoluteFill>hello</AbsoluteFill>;',
				'};',
				'',
			].join('\n'),
		);

		await expect(
			insertJsxElementIntoComposition({
				remotionRoot: tempDir,
				compositionFile: 'Root.tsx',
				compositionId: 'test',
				element: {
					type: 'asset',
					assetType: 'audio',
					src: 'audio.mp3',
					srcType: 'static',
					dimensions: null,
					durationInFrames: null,
					position: null,
				},
				prettierConfigOverride: {singleQuote: true, useTabs: true},
			}),
		).rejects.toThrow('Cannot add <Audio> because Audio is already defined');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a component into the resolved composition component', async () => {
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
				type: 'component',
				componentName: 'Circle',
				importName: 'Circle',
				importPath: '@remotion/shapes',
				props: [
					{name: 'fill', value: '#0b84ff'},
					{name: 'dataShapeIndex', value: 1},
					{name: 'debug', value: false},
				],
				position: null,
			},
			from: 42,
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import { Circle } from '@remotion/shapes';",
		);
		expect(result.output).toContain('<Circle');
		expect(result.output).toContain('fill="#0b84ff"');
		expect(result.output).toContain('dataShapeIndex={1}');
		expect(result.output).toContain('debug={false}');
		expect(result.output).toContain('from={42}');
		expect(result.output).toContain("position: 'absolute'");
		expect(result.output).not.toContain('<Sequence');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('wraps a component in a dimensionless Sequence', async () => {
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
				type: 'component',
				componentName: 'LowerThird',
				importName: 'LowerThird',
				importPath: './lower-third.element',
				props: [],
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
			wrapInSequence: {
				dimensions: null,
				from: 42,
				name: 'Lower Third',
				position: {x: 120, y: 80.5},
			},
		});

		expect(result.output).toContain(
			"import { AbsoluteFill, Sequence } from 'remotion';",
		);
		expect(result.output).toContain(
			"import { LowerThird } from './lower-third.element';",
		);
		expect(result.output).toContain('<Sequence');
		expect(result.output).toContain('from={42}');
		expect(result.output).toContain('name="Lower Third"');
		expect(result.output).toContain("translate: '120px 80.5px'");
		expect(result.output).toContain('<LowerThird />');
		expect(result.output).not.toContain('width={');
		expect(result.output).not.toContain('height={');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a composition as a duration-aware Sequence', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {Source} from './Source';",
				"import {Target} from './Target';",
				'export const RemotionRoot = () => {',
				'\treturn (',
				'\t\t<>',
				'\t\t\t<Composition id="source" component={Source} />',
				'\t\t\t<Composition id="target" component={Target} />',
				'\t\t</>',
				'\t);',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'Source.tsx'),
			[
				'export const Source: React.FC = () => {',
				'\treturn <div>source</div>;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'Target.tsx'),
			[
				"import {AbsoluteFill} from 'remotion';",
				'',
				'export const Target: React.FC = () => {',
				'\treturn <AbsoluteFill>target</AbsoluteFill>;',
				'};',
				'',
			].join('\n'),
		);

		const result = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element: {
				type: 'composition',
				compositionId: 'source',
				compositionFile: 'Root.tsx',
				durationInFrames: 100,
				width: 1080,
				height: 540,
				serializedResolvedPropsWithCustomSchema: JSON.stringify({
					hi: 'there',
					nested: {value: 1},
					'dash-prop': 'ok',
					img: `${NoReactInternals.FILE_TOKEN}image.png`,
					date: `${NoReactInternals.DATE_TOKEN}2025-01-01T00:00:00.000Z`,
				}),
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain("import { Source } from './Source';");
		expect(result.output).toContain('Sequence');
		expect(result.output).toContain('<Sequence');
		expect(result.output).toContain('width={1080}');
		expect(result.output).toContain('height={540}');
		expect(result.output).toContain('durationInFrames={100}');
		expect(result.output).toContain('name="source"');
		expect(result.output).toContain('<Source');
		expect(result.output).toContain('hi="there"');
		expect(result.output).toContain('nested={{');
		expect(result.output).toContain('value: 1');
		expect(result.output).toContain("'dash-prop': 'ok'");
		expect(result.output).toContain("img={staticFile('image.png')}");
		expect(result.output).toContain(
			"date={new Date('2025-01-01T00:00:00.000Z')}",
		);
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('inserts a default-exported composition next to an existing namespace import', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import Source from './Source';",
				"import {Target} from './Target';",
				'export const RemotionRoot = () => {',
				'\treturn (',
				'\t\t<>',
				'\t\t\t<Composition id="source" component={Source} />',
				'\t\t\t<Composition id="target" component={Target} />',
				'\t\t</>',
				'\t);',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'Source.tsx'),
			[
				'const Source: React.FC = () => {',
				'\treturn <div>source</div>;',
				'};',
				'',
				'export default Source;',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'Target.tsx'),
			[
				"import {AbsoluteFill} from 'remotion';",
				"import * as SourceModule from './Source';",
				'',
				'export const Target: React.FC = () => {',
				'\treturn <AbsoluteFill>target</AbsoluteFill>;',
				'};',
				'',
			].join('\n'),
		);

		const result = await insertJsxElementIntoComposition({
			remotionRoot: tempDir,
			compositionFile: 'Root.tsx',
			compositionId: 'target',
			element: {
				type: 'composition',
				compositionId: 'source',
				compositionFile: 'Root.tsx',
				durationInFrames: 100,
				width: 1080,
				height: 540,
				serializedResolvedPropsWithCustomSchema: JSON.stringify({}),
				position: null,
			},
			prettierConfigOverride: {singleQuote: true, useTabs: true},
		});

		expect(result.output).toContain(
			"import * as SourceModule from './Source';",
		);
		expect(result.output).toContain("import Source from './Source';");
		expect(result.output).not.toContain(
			"import Source, * as SourceModule from './Source';",
		);
		expect(result.output).toContain('<Source');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('rejects array payloads for resolved composition props', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		await fs.writeFile(
			path.join(tempDir, 'Root.tsx'),
			[
				"import {Composition} from 'remotion';",
				"import {Source} from './Source';",
				"import {Target} from './Target';",
				'export const RemotionRoot = () => {',
				'\treturn (',
				'\t\t<>',
				'\t\t\t<Composition id="source" component={Source} />',
				'\t\t\t<Composition id="target" component={Target} />',
				'\t\t</>',
				'\t);',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'Source.tsx'),
			[
				'export const Source: React.FC = () => {',
				'\treturn <div>source</div>;',
				'};',
				'',
			].join('\n'),
		);
		await fs.writeFile(
			path.join(tempDir, 'Target.tsx'),
			[
				"import {AbsoluteFill} from 'remotion';",
				'',
				'export const Target: React.FC = () => {',
				'\treturn <AbsoluteFill>target</AbsoluteFill>;',
				'};',
				'',
			].join('\n'),
		);

		await expect(
			insertJsxElementIntoComposition({
				remotionRoot: tempDir,
				compositionFile: 'Root.tsx',
				compositionId: 'target',
				element: {
					type: 'composition',
					compositionId: 'source',
					compositionFile: 'Root.tsx',
					durationInFrames: 100,
					width: 1080,
					height: 540,
					serializedResolvedPropsWithCustomSchema: JSON.stringify([
						'not',
						'an object',
					]),
					position: null,
				},
				prettierConfigOverride: {singleQuote: true, useTabs: true},
			}),
		).rejects.toThrow('Resolved composition props must be an object');
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

test('rejects composition insertion requests that traverse out of the project root', async () => {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-resolve-'));
	try {
		const response = await insertJsxElementHandler({
			input: {
				compositionFile: 'Root.tsx',
				compositionId: 'target',
				element: {
					type: 'composition',
					compositionId: 'source',
					compositionFile: '../Root.tsx',
					durationInFrames: 100,
					width: 1080,
					height: 540,
					serializedResolvedPropsWithCustomSchema: JSON.stringify({}),
					position: null,
				},
			},
			entryPoint: path.join(tempDir, 'Root.tsx'),
			remotionRoot: tempDir,
			request: {} as never,
			response: {} as never,
			logLevel: 'error',
			methods: {
				removeJob: () => undefined,
				cancelJob: () => undefined,
				addJob: () => undefined,
			},
			publicDir: tempDir,
			binariesDirectory: null,
		});

		expect(response.success).toBe(false);
		if (!response.success) {
			expect(response.reason).toBe('Unsupported composition file');
		}
	} finally {
		await fs.rm(tempDir, {recursive: true, force: true});
	}
});

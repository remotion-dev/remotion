import {expect, test} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {resolveCompositionComponent} from '../helpers/resolve-composition-component';

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

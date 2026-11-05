import {expect, spyOn, test} from 'bun:test';
import * as childProcess from 'node:child_process';
import {EventEmitter} from 'node:events';
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {PassThrough} from 'node:stream';
import {staticFileRef} from '@remotion/studio-protocol';
import {VERSION} from 'remotion/version';
import {installElement} from '../install-element';

const elementSource = `import {Img, Sequence, type SequenceProps} from 'remotion';
import {noise2D} from '@remotion/noise';

export const LowerThird = ({
	logoSrc,
	title,
	...props
}: {logoSrc: string; title: string} & SequenceProps) => (
	<Sequence {...props}>
		<Img src={logoSrc} style={{opacity: 0.5 + noise2D('logo', 0, 0) / 2}} />
		<h1>{title}</h1>
	</Sequence>
);
`;

const makeProject = () => {
	const remotionRoot = mkdtempSync(path.join(tmpdir(), 'remotion-project-'));
	const srcDir = path.join(remotionRoot, 'src');
	mkdirSync(srcDir);
	writeFileSync(
		path.join(remotionRoot, 'package.json'),
		JSON.stringify(
			{
				name: 'my-video',
				private: true,
				dependencies: {
					'@remotion/cli': VERSION,
					'@remotion/shapes': VERSION,
					react: '19.0.0',
					'react-dom': '19.0.0',
					remotion: VERSION,
				},
			},
			null,
			2,
		),
	);
	writeFileSync(path.join(remotionRoot, 'bun.lock'), '');
	writeFileSync(
		path.join(srcDir, 'index.ts'),
		`import {registerRoot} from 'remotion';
import {RemotionRoot} from './Root';

registerRoot(RemotionRoot);
`,
	);
	writeFileSync(
		path.join(srcDir, 'Root.tsx'),
		`import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';

const MyVideo = () => {
	return <AbsoluteFill style={{backgroundColor: 'white'}} />;
};

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="MyVideo"
			component={MyVideo}
			durationInFrames={150}
			fps={30}
			width={1920}
			height={1080}
		/>
	);
};
`,
	);

	return {
		remotionRoot,
		entryPoint: path.join(srcDir, 'index.ts'),
		publicDir: path.join(remotionRoot, 'public'),
		rootFile: path.join(srcDir, 'Root.tsx'),
	};
};

// The package manager is an external process, so only `spawn` is faked.
const fakePackageManager = () => {
	const calls: Array<{
		command: string;
		args: readonly string[];
		cwd: string | URL | undefined;
	}> = [];
	const spawnSpy = spyOn(childProcess, 'spawn').mockImplementation(((
		command: string,
		args: readonly string[],
		options: childProcess.SpawnOptions,
	) => {
		calls.push({command, args, cwd: options.cwd});
		const child = new EventEmitter() as ReturnType<typeof childProcess.spawn>;
		const stdout = new PassThrough();
		const stderr = new PassThrough();
		child.stdout = stdout;
		child.stderr = stderr;
		queueMicrotask(() => {
			stdout.end();
			stderr.end();
			child.emit('close', 0, null);
		});
		return child;
	}) as typeof childProcess.spawn);

	return {calls, restore: () => spawnSpy.mockRestore()};
};

test('installs an Element into a project without a running Studio', async () => {
	const project = makeProject();
	const packageManager = fakePackageManager();
	try {
		const response = await installElement({
			installationName: null,
			compositionFile: 'src/Root.tsx',
			compositionId: 'MyVideo',
			element: {
				assets: [{path: 'elements/logo.png', type: 'base64', data: 'iVBORw=='}],
				dependencies: [
					{name: '@remotion/noise', version: null},
					{name: '@remotion/shapes', version: null},
					{name: 'lodash', version: '4.17.21'},
				],
				dimensions: {width: 900, height: 260},
				durationInFrames: 72,
				initialProps: {
					logoSrc: staticFileRef('elements/logo.png'),
					title: 'Hello world',
				},
				installationMode: 'component-owned-sequence',
				isCaptionStyle: false,
				displayName: 'Lower Third',
				slug: 'overlays/lower-third',
				sourceCode: elementSource,
			},
			expectedFileState: null,
			from: 30,
			captionTarget: null,
			overwriteExisting: false,
			position: null,
			undoRedoNavigation: null,
			newComposition: null,
			entryPoint: project.entryPoint,
			remotionRoot: project.remotionRoot,
			publicDir: project.publicDir,
			logLevel: 'error',
			installDependencies: true,
			studio: false,
		});

		expect(response).toMatchObject({success: true});

		// Missing dependencies are installed with the project's package manager,
		// with Remotion packages at the project's Remotion version.
		expect(packageManager.calls).toHaveLength(1);
		const [install] = packageManager.calls;
		expect(install!.command).toBe('bun');
		expect(install!.cwd).toBe(project.remotionRoot);
		expect(install!.args).toEqual(
			expect.arrayContaining([`@remotion/noise@${VERSION}`, 'lodash@4.17.21']),
		);
		expect(install!.args.join(' ')).not.toContain('@remotion/shapes');

		expect(
			readFileSync(
				path.join(project.remotionRoot, 'src', 'lower-third.element.tsx'),
				'utf-8',
			),
		).toBe(elementSource);

		expect([
			...readFileSync(path.join(project.publicDir, 'elements', 'logo.png')),
		]).toEqual([0x89, 0x50, 0x4e, 0x47]);

		const root = readFileSync(project.rootFile, 'utf-8');
		expect(root).toContain("import {LowerThird} from './lower-third.element';");
		const insertedElement = root.match(/<LowerThird\b[\s\S]*?\/>/)?.[0];
		expect(insertedElement).toBeDefined();
		expect(insertedElement).toMatch(
			/logoSrc=\{staticFile\(["']elements\/logo\.png["']\)\}/,
		);
		expect(insertedElement).toMatch(/title=["']Hello world["']/);
		expect(insertedElement).toMatch(/from=\{30\}/);
		expect(insertedElement).toMatch(/durationInFrames=\{72\}/);
		expect(insertedElement).toMatch(/name=["']Lower Third["']/);
		expect(insertedElement).toMatch(/width:\s*900/);
		expect(insertedElement).toMatch(/height:\s*260/);
	} finally {
		packageManager.restore();
		rmSync(project.remotionRoot, {force: true, recursive: true});
	}
});

import {expect, test} from 'bun:test';
import {strFromU8, unzipSync} from 'fflate';
import {createBrowserStudioOperations} from '../browser-studio-operations';
import {makeBrowserStudioProjectArchive} from '../download-project';
import {createBlankTemplateProject} from '../templates/blank';
import type {VirtualProject} from '../types';

const dependencyVersions = {
	react: '19.2.3',
	'react-dom': '19.2.3',
	remotion: '4.0.500',
};

test('downloads the current Browser Studio project as a runnable archive', async () => {
	let project: VirtualProject = {
		...createBlankTemplateProject(),
		publicFiles: {
			'/logo.bin': new Uint8Array([0, 127, 128, 255]),
		},
	};
	const operations = createBrowserStudioOperations({
		dependencyVersions,
		getStaticFiles: null,
		getProject: () => project,
		onProjectChange: (nextProject) => {
			project = nextProject;
		},
	});

	const insertResult = await operations.insertSolid({
		compositionFile: '/project/src/Composition.tsx',
		compositionId: 'MyComp',
		element: {
			type: 'solid',
			width: 1280,
			height: 720,
			position: null,
		},
		from: null,
	});
	expect(insertResult).toEqual({success: true});

	const archive = await operations.downloadProject();

	const files = unzipSync(archive.data);
	const packageJson = JSON.parse(strFromU8(files['package.json'])) as Record<
		string,
		unknown
	>;

	expect(archive.fileName).toBe('remotion-project.zip');
	expect(strFromU8(files['src/Composition.tsx'])).toContain(
		'<Solid width={1280}',
	);
	expect(strFromU8(files['tsconfig.json'])).toBe(
		project.files['/project/tsconfig.json'],
	);
	expect(strFromU8(files['remotion.config.ts'])).toBe(
		project.files['/project/remotion.config.ts'],
	);
	expect(files['public/logo.bin']).toEqual(new Uint8Array([0, 127, 128, 255]));
	expect(Object.keys(files).every((path) => !path.startsWith('/project'))).toBe(
		true,
	);
	expect(packageJson).toMatchObject({
		scripts: {
			dev: 'remotion studio',
		},
		dependencies: {
			'@remotion/cli': '4.0.500',
			react: '19.2.3',
			'react-dom': '19.2.3',
			remotion: '4.0.500',
		},
		devDependencies: {
			'@remotion/eslint-config-flat': '4.0.500',
		},
	});
	expect(strFromU8(files['package.json'])).not.toMatch(
		/(?:workspace|catalog):/,
	);
});

test('adds a package.json if the virtual project has none', () => {
	const {data} = makeBrowserStudioProjectArchive({
		dependencyVersions,
		project: {
			rootDir: '/project',
			entryPoint: '/project/src/index.ts',
			files: {
				'/project/src/index.ts': 'export {};',
			},
		},
	});
	const files = unzipSync(data);
	const packageJson = JSON.parse(strFromU8(files['package.json'])) as {
		scripts: Record<string, string>;
	};

	expect(packageJson.scripts.dev).toBe('remotion studio');
});

test('rejects unsafe paths and archive collisions', () => {
	const invalidProjects: VirtualProject[] = [
		{
			rootDir: '/project',
			entryPoint: '/project/src/index.ts',
			files: {'/other/index.ts': 'export {};'},
		},
		{
			rootDir: '/project',
			entryPoint: '/project/src/index.ts',
			files: {'../index.ts': 'export {};'},
		},
		{
			rootDir: '/project',
			entryPoint: '/project/src/index.ts',
			files: {'/project/public/logo.svg': '<svg />'},
			publicFiles: {'logo.svg': '<svg />'},
		},
	];

	for (const project of invalidProjects) {
		expect(() =>
			makeBrowserStudioProjectArchive({dependencyVersions, project}),
		).toThrow();
	}
});

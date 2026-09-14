import {afterEach, expect, test} from 'bun:test';
import {
	loadGitHubRepository,
	type LoadGitHubRepositoryProgress,
} from '../load-github-repository';

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

test('loads a GitHub repository into a virtual project', async () => {
	const rawFiles: Record<string, Uint8Array | string> = {
		'package.json': '{"name":"example"}',
		'public/audio.wav': new Uint8Array([0, 1, 2, 255]),
		'public/captions.json': '[{"text":"Hello"}]',
		'Promo.png': new Uint8Array([137, 80, 78, 71, 0, 255]),
		'src/Root.tsx': 'export const Root = () => null;',
		'src/index.ts': 'import {registerRoot} from "remotion";',
	};
	const encoder = new TextEncoder();
	const tree = Object.entries(rawFiles).map(([path, contents]) => ({
		path,
		size:
			typeof contents === 'string'
				? encoder.encode(contents).byteLength
				: contents.byteLength,
		type: 'blob',
	}));
	globalThis.fetch = ((input: RequestInfo | URL) => {
		const url = input.toString();
		if (url.includes('api.github.com')) {
			return Promise.resolve(
				Response.json({
					sha: 'ddc7ec42c2c9c06e84c9d5d2606e7ffc1394d900',
					tree,
					truncated: false,
				}),
			);
		}

		const marker = '/ddc7ec42c2c9c06e84c9d5d2606e7ffc1394d900/';
		const path = decodeURIComponent(
			url.slice(url.indexOf(marker) + marker.length),
		);
		const contents = rawFiles[path];
		if (contents === undefined) {
			return Promise.resolve(new Response(null, {status: 404}));
		}

		return Promise.resolve(
			new Response(
				typeof contents === 'string' ? contents : contents.slice().buffer,
			),
		);
	}) as unknown as typeof fetch;

	const progress: LoadGitHubRepositoryProgress[] = [];
	const project = await loadGitHubRepository({
		onProgress: (update) => progress.push(update),
		repoUrl: 'https://github.com/remotion-dev/example.git',
	});

	expect(project.rootDir).toBe('/project');
	expect(project.entryPoint).toBe('/project/src/index.ts');
	expect(project.files['/project/src/Root.tsx']).toBe(
		'export const Root = () => null;',
	);
	expect(project.files['/project/Promo.png']).toBeUndefined();
	expect(project.publicFiles?.['audio.wav']).toEqual(
		new Uint8Array([0, 1, 2, 255]),
	);
	const captions = project.publicFiles?.['captions.json'];
	if (!(captions instanceof Uint8Array)) {
		throw new Error('Expected captions.json to be a Uint8Array');
	}

	expect(new TextDecoder().decode(captions)).toBe('[{"text":"Hello"}]');
	expect(progress[0]).toEqual({phase: 'reading-repository'});
	expect(progress.at(-1)).toEqual({phase: 'preparing-project'});
	expect(
		progress.some(
			(update) =>
				update.phase === 'downloading-files' &&
				update.loadedFiles === tree.length &&
				update.loadedBytes === tree.reduce((sum, entry) => sum + entry.size, 0),
		),
	).toBe(true);
});

test('validates GitHub repository URLs before fetching', async () => {
	await expect(
		loadGitHubRepository({repoUrl: 'https://example.com/owner/repo'}),
	).rejects.toThrow('must be an https://github.com URL');
	await expect(
		loadGitHubRepository({
			repoUrl: 'https://github.com/owner/repo/tree/main',
		}),
	).rejects.toThrow('must point to a repository');
});

test('reports GitHub API errors', async () => {
	globalThis.fetch = (() =>
		Promise.resolve(
			Response.json({message: 'Not Found'}, {status: 404}),
		)) as unknown as typeof fetch;

	await expect(
		loadGitHubRepository({
			repoUrl: 'https://github.com/remotion-dev/missing',
		}),
	).rejects.toThrow('Could not read remotion-dev/missing: Not Found');
});

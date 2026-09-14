import {
	createBrowserStudioProjectStorage,
	deleteBrowserStudioProjectStorage,
	writeBrowserStudioStoredPublicFile,
} from './opfs-public-files';
import type {VirtualProject} from './types';
import type {VirtualProjectPublicFile} from './types';

type GitHubTreeEntry = {
	path: string;
	size?: number;
	type: 'blob' | 'commit' | 'tree';
};

type GitHubTreeResponse = {
	message?: string;
	sha?: string;
	tree?: GitHubTreeEntry[];
	truncated?: boolean;
};

export type LoadGitHubRepositoryProgress =
	| {
			phase: 'reading-repository';
	  }
	| {
			loadedBytes: number;
			loadedFiles: number;
			phase: 'downloading-files';
			totalBytes: number;
			totalFiles: number;
	  }
	| {
			phase: 'preparing-project';
	  };

const entryPointCandidates = [
	'src/index.ts',
	'src/index.tsx',
	'src/index.js',
	'src/index.mjs',
	'remotion/index.tsx',
	'remotion/index.ts',
	'remotion/index.js',
	'remotion/index.mjs',
	'src/remotion/index.tsx',
	'src/remotion/index.ts',
	'src/remotion/index.js',
	'src/remotion/index.mjs',
];

const maximumRepositoryBytes = 100 * 1024 * 1024;
const maximumRepositoryFiles = 2_000;
const downloadConcurrency = 8;

const parseGitHubRepositoryUrl = (repoUrl: string) => {
	let url: URL;
	try {
		url = new URL(repoUrl);
	} catch {
		throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
	}

	if (url.protocol !== 'https:' || url.hostname !== 'github.com') {
		throw new Error('The repo parameter must be an https://github.com URL.');
	}

	const pathSegments = url.pathname.split('/').filter(Boolean);
	if (pathSegments.length !== 2) {
		throw new Error(
			'The GitHub URL must point to a repository, for example https://github.com/remotion-dev/template-audiogram.',
		);
	}

	const owner = pathSegments[0];
	const repo = pathSegments[1].replace(/\.git$/, '');
	if (
		!owner ||
		!repo ||
		![owner, repo].every((part) => /^[a-zA-Z0-9_.-]+$/.test(part))
	) {
		throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
	}

	return {owner, repo};
};

const getResponseError = async (response: Response) => {
	try {
		const body = (await response.json()) as {message?: unknown};
		if (typeof body.message === 'string') {
			return body.message;
		}
	} catch {
		// The GitHub raw file server generally has no JSON error body.
	}

	return response.statusText || `HTTP ${response.status}`;
};

const encodePath = (path: string) =>
	path
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');

const validateRepositoryPath = (path: string) => {
	if (
		path.includes('\\') ||
		path.includes('\0') ||
		path
			.split('/')
			.some((segment) => segment === '' || segment === '.' || segment === '..')
	) {
		throw new Error(`The repository contains an unsupported path: ${path}`);
	}
};

const decodeTextFile = (contents: Uint8Array) => {
	if (contents.includes(0)) {
		return null;
	}

	try {
		return new TextDecoder('utf-8', {fatal: true}).decode(contents);
	} catch {
		return null;
	}
};

export const loadGitHubRepository = async ({
	onProgress,
	repoUrl,
	signal,
}: {
	onProgress?: (progress: LoadGitHubRepositoryProgress) => void;
	repoUrl: string;
	signal?: AbortSignal;
}): Promise<VirtualProject> => {
	const {owner, repo} = parseGitHubRepositoryUrl(repoUrl);
	onProgress?.({phase: 'reading-repository'});

	const treeResponse = await fetch(
		`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/HEAD?recursive=1`,
		{signal},
	);
	if (!treeResponse.ok) {
		throw new Error(
			`Could not read ${owner}/${repo}: ${await getResponseError(treeResponse)}`,
		);
	}

	const tree = (await treeResponse.json()) as GitHubTreeResponse;
	if (!tree.tree || !tree.sha) {
		throw new Error(
			`Could not read ${owner}/${repo}: ${tree.message ?? 'GitHub returned an invalid file tree.'}`,
		);
	}

	const treeSha = tree.sha;

	if (tree.truncated) {
		throw new Error(
			`${owner}/${repo} has too many files for Browser Studio to load.`,
		);
	}

	const fileEntries = tree.tree.filter(
		(entry): entry is GitHubTreeEntry & {type: 'blob'} => entry.type === 'blob',
	);
	for (const file of fileEntries) {
		validateRepositoryPath(file.path);
	}

	if (fileEntries.length > maximumRepositoryFiles) {
		throw new Error(
			`${owner}/${repo} has ${fileEntries.length.toLocaleString()} files. Browser Studio supports up to ${maximumRepositoryFiles.toLocaleString()}.`,
		);
	}

	const totalBytes = fileEntries.reduce(
		(total, entry) => total + (entry.size ?? 0),
		0,
	);
	if (totalBytes > maximumRepositoryBytes) {
		throw new Error(
			`${owner}/${repo} is larger than the 100 MB Browser Studio limit.`,
		);
	}

	let loadedBytes = 0;
	let loadedFiles = 0;
	const files: Record<string, string> = {};
	const publicFiles: Record<string, VirtualProjectPublicFile> = {};
	const hasPublicFiles = fileEntries.some((file) =>
		file.path.startsWith('public/'),
	);
	const publicFileStorage = hasPublicFiles
		? await createBrowserStudioProjectStorage()
		: null;
	const totalFiles = fileEntries.length;
	const reportDownloadProgress = () =>
		onProgress?.({
			loadedBytes,
			loadedFiles,
			phase: 'downloading-files',
			totalBytes,
			totalFiles,
		});
	reportDownloadProgress();

	let nextFileIndex = 0;
	try {
		await Promise.all(
			Array.from(
				{length: Math.min(downloadConcurrency, fileEntries.length)},
				async () => {
					while (nextFileIndex < fileEntries.length) {
						const file = fileEntries[nextFileIndex++];
						const response = await fetch(
							`https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(treeSha)}/${encodePath(file.path)}`,
							{signal},
						);
						if (!response.ok) {
							throw new Error(
								`Could not download ${file.path}: ${await getResponseError(response)}`,
							);
						}

						let loadedByteLength = file.size ?? 0;
						if (file.path.startsWith('public/') && publicFileStorage) {
							const contents = response.body ?? (await response.blob());
							const storedFile = await writeBrowserStudioStoredPublicFile({
								contents,
								storage: publicFileStorage,
							});
							publicFiles[file.path.slice('public/'.length)] = storedFile;
							loadedByteLength = storedFile.sizeInBytes;
						} else {
							const contents = new Uint8Array(await response.arrayBuffer());
							loadedByteLength = contents.byteLength;
							if (file.path.startsWith('public/')) {
								publicFiles[file.path.slice('public/'.length)] = contents;
							} else {
								const text = decodeTextFile(contents);
								if (text !== null) {
									files[`/project/${file.path}`] = text;
								}
							}
						}

						loadedBytes += file.size ?? loadedByteLength;
						loadedFiles++;
						reportDownloadProgress();
					}
				},
			),
		);
	} catch (error) {
		if (publicFileStorage) {
			await deleteBrowserStudioProjectStorage(publicFileStorage);
		}

		throw error;
	}

	onProgress?.({phase: 'preparing-project'});
	const entryPoint = entryPointCandidates.find(
		(candidate) => files[`/project/${candidate}`] !== undefined,
	);
	if (!entryPoint) {
		if (publicFileStorage) {
			await deleteBrowserStudioProjectStorage(publicFileStorage);
		}

		throw new Error(
			`${owner}/${repo} does not have a supported Remotion entry point. Expected src/index.ts or another standard Remotion entry point.`,
		);
	}

	return {
		entryPoint: `/project/${entryPoint}`,
		files,
		publicFiles,
		publicFileStorage: publicFileStorage ?? undefined,
		rootDir: '/project',
	};
};

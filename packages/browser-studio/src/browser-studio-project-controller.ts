import {findSearchPosition} from '@remotion/studio-codemods';
import type {
	BrowserStudioOperations,
	EventSourceEvent,
	RedoResponse,
	UndoResponse,
} from '@remotion/studio-shared';
import type {VirtualProject} from './types';

type HistoryEntry = {
	before: VirtualProject;
	after: VirtualProject;
	fileName: string;
};

type ProjectMutation = {
	fileName: string;
	mutate: (project: VirtualProject) => VirtualProject;
};

const MAX_HISTORY_ENTRIES = 100;

const normalizePublicFilePath = (path: string) => {
	const withoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path;

	if (
		withoutLeadingSlash.length === 0 ||
		withoutLeadingSlash.includes('\\') ||
		withoutLeadingSlash.includes('\0') ||
		withoutLeadingSlash
			.split('/')
			.some((segment) => segment === '' || segment === '.' || segment === '..')
	) {
		throw new Error(`Invalid public file path: ${path}`);
	}

	return withoutLeadingSlash;
};

const getCanonicalPublicFiles = (project: VirtualProject) => {
	const canonicalFiles: Record<string, Uint8Array | string> = {};

	for (const [path, contents] of Object.entries(project.publicFiles ?? {})) {
		const canonicalPath = normalizePublicFilePath(path);
		if (Object.hasOwn(canonicalFiles, canonicalPath)) {
			throw new Error(`Multiple public files resolve to ${canonicalPath}`);
		}

		canonicalFiles[canonicalPath] = contents;
	}

	return canonicalFiles;
};

const arePublicFileContentsEqual = (
	left: Uint8Array | string | undefined,
	right: Uint8Array | string | undefined,
) => {
	if (left === right) {
		return true;
	}

	if (typeof left === 'string' || typeof right === 'string') {
		return false;
	}

	if (!left || !right || left.length !== right.length) {
		return false;
	}

	return left.every((value, index) => value === right[index]);
};

const areStringRecordsEqual = (
	left: Record<string, string>,
	right: Record<string, string>,
) => {
	const leftEntries = Object.entries(left);
	if (leftEntries.length !== Object.keys(right).length) {
		return false;
	}

	return leftEntries.every(([path, contents]) => right[path] === contents);
};

const arePublicFileRecordsEqual = (
	left: Record<string, Uint8Array | string> | undefined,
	right: Record<string, Uint8Array | string> | undefined,
) => {
	const leftEntries = Object.entries(left ?? {});
	if (leftEntries.length !== Object.keys(right ?? {}).length) {
		return false;
	}

	return leftEntries.every(([path, contents]) =>
		arePublicFileContentsEqual(contents, right?.[path]),
	);
};

export const areBrowserStudioProjectsEqual = (
	left: VirtualProject,
	right: VirtualProject,
) => {
	if (left === right) {
		return true;
	}

	return (
		left.entryPoint === right.entryPoint &&
		left.rootDir === right.rootDir &&
		areStringRecordsEqual(left.files, right.files) &&
		arePublicFileRecordsEqual(left.publicFiles, right.publicFiles)
	);
};

const getChangedPublicFilePaths = (
	previousProject: VirtualProject,
	nextProject: VirtualProject,
) => {
	const previous = getCanonicalPublicFiles(previousProject);
	const next = getCanonicalPublicFiles(nextProject);
	const paths = new Set([...Object.keys(previous), ...Object.keys(next)]);

	return [...paths].filter(
		(path) => !arePublicFileContentsEqual(previous[path], next[path]),
	);
};

const encodePublicFilePath = (path: string) =>
	path
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');

export const getBrowserStudioStaticFiles = ({
	getSrc,
	lastModifiedByPath,
	project,
}: {
	getSrc: ((name: string, contents: Uint8Array | string) => string) | null;
	lastModifiedByPath: ReadonlyMap<string, number> | null;
	project: VirtualProject;
}) => {
	return Object.entries(getCanonicalPublicFiles(project)).map(
		([name, contents]) => ({
			lastModified:
				lastModifiedByPath === null ? 0 : (lastModifiedByPath.get(name) ?? 0),
			name,
			sizeInBytes:
				typeof contents === 'string'
					? new TextEncoder().encode(contents).byteLength
					: contents.byteLength,
			src:
				getSrc === null
					? `/${encodePublicFilePath(name)}`
					: getSrc(name, contents),
		}),
	);
};

export const createBrowserStudioPublicFileManager = ({
	createObjectUrl,
	revokeObjectUrl,
}: {
	createObjectUrl: ((blob: Blob) => string) | null;
	revokeObjectUrl: ((url: string) => void) | null;
}) => {
	const resolvedCreateObjectUrl =
		createObjectUrl === null
			? (blob: Blob) => URL.createObjectURL(blob)
			: createObjectUrl;
	const resolvedRevokeObjectUrl =
		revokeObjectUrl === null
			? (url: string) => URL.revokeObjectURL(url)
			: revokeObjectUrl;
	const objectUrls = new Map<
		string,
		{contents: Uint8Array | string; url: string}
	>();

	const getObjectUrl = (name: string, contents: Uint8Array | string) => {
		const existing = objectUrls.get(name);
		if (arePublicFileContentsEqual(existing?.contents, contents)) {
			return existing!.url;
		}

		if (existing) {
			resolvedRevokeObjectUrl(existing.url);
		}

		const blobContents =
			typeof contents === 'string' ? contents : contents.slice().buffer;
		const url = resolvedCreateObjectUrl(new Blob([blobContents]));
		objectUrls.set(name, {
			contents: typeof contents === 'string' ? contents : contents.slice(),
			url,
		});
		return url;
	};

	const getStaticFiles = ({
		lastModifiedByPath,
		project,
	}: {
		lastModifiedByPath: ReadonlyMap<string, number> | null;
		project: VirtualProject;
	}) => {
		const currentNames = new Set(Object.keys(getCanonicalPublicFiles(project)));
		for (const [name, entry] of objectUrls) {
			if (!currentNames.has(name)) {
				resolvedRevokeObjectUrl(entry.url);
				objectUrls.delete(name);
			}
		}

		return getBrowserStudioStaticFiles({
			getSrc: getObjectUrl,
			lastModifiedByPath,
			project,
		});
	};

	return {
		dispose: () => {
			for (const {url} of objectUrls.values()) {
				resolvedRevokeObjectUrl(url);
			}

			objectUrls.clear();
		},
		getStaticFiles,
	};
};

const getFileSource = ({
	fileName,
	project,
}: {
	fileName: string;
	project: VirtualProject;
}) => {
	const withoutQuery = fileName.split(/[?#]/)[0];
	const normalizedFileName = withoutQuery.replace(/\\/g, '/');
	const rootDir = project.rootDir.replace(/\/$/, '');

	const directCandidates = [
		normalizedFileName,
		normalizedFileName.startsWith('/')
			? normalizedFileName
			: `${rootDir}/${normalizedFileName.replace(/^\.\//, '')}`,
	];

	for (const candidate of directCandidates) {
		const contents = project.files[candidate];
		if (contents !== undefined) {
			return contents;
		}
	}

	const matchingEntries = Object.entries(project.files).filter(([path]) => {
		const relativePath = path.startsWith(`${rootDir}/`)
			? path.slice(rootDir.length + 1)
			: path.replace(/^\//, '');
		return (
			normalizedFileName === relativePath ||
			normalizedFileName.endsWith(`/${relativePath}`)
		);
	});

	return matchingEntries.length === 1 ? matchingEntries[0][1] : null;
};

export type BrowserStudioProjectController = {
	applyMutation: (mutation: ProjectMutation) => VirtualProject;
	deleteStaticFile: BrowserStudioOperations['deleteStaticFile'];
	emitEvent: (event: EventSourceEvent) => void;
	findInFile: BrowserStudioOperations['findInFile'];
	getFileSource: BrowserStudioOperations['getFileSource'];
	redo: BrowserStudioOperations['redo'];
	resetHistory: () => void;
	renameStaticFile: BrowserStudioOperations['renameStaticFile'];
	subscribeToEvent: BrowserStudioOperations['subscribeToEvent'];
	undo: BrowserStudioOperations['undo'];
	writeStaticFile: BrowserStudioOperations['writeStaticFile'];
};

export type BrowserStudioStaticFilesGetter = (input: {
	lastModifiedByPath: ReadonlyMap<string, number> | null;
	project: VirtualProject;
}) => ReturnType<typeof getBrowserStudioStaticFiles>;

export const createBrowserStudioProjectController = ({
	getStaticFiles,
	getProject,
	onProjectChange,
}: {
	getStaticFiles: BrowserStudioStaticFilesGetter | null;
	getProject: () => VirtualProject;
	onProjectChange: (project: VirtualProject) => void;
}): BrowserStudioProjectController => {
	const resolvedGetStaticFiles: BrowserStudioStaticFilesGetter =
		getStaticFiles === null
			? ({lastModifiedByPath: revisionByPath, project}) =>
					getBrowserStudioStaticFiles({
						getSrc: null,
						lastModifiedByPath: revisionByPath,
						project,
					})
			: getStaticFiles;
	const undoStack: HistoryEntry[] = [];
	const redoStack: HistoryEntry[] = [];
	const listeners = new Set<(event: EventSourceEvent) => void>();
	const lastModifiedByPath = new Map<string, number>();
	let latestHmrEvent: Extract<EventSourceEvent, {type: 'hmr'}> | null = null;
	let publicFileRevision = 0;

	const getUndoRedoEvent = (): EventSourceEvent => ({
		type: 'undo-redo-stack-changed',
		undoFile: undoStack.at(-1)?.fileName ?? null,
		redoFile: redoStack.at(-1)?.fileName ?? null,
	});

	const getPublicFilesEvent = (): EventSourceEvent => ({
		type: 'new-public-folder',
		files: resolvedGetStaticFiles({
			lastModifiedByPath,
			project: getProject(),
		}),
		folderExists: '/public',
	});

	const emit = (event: EventSourceEvent) => {
		if (event.type === 'hmr' && listeners.size === 0) {
			latestHmrEvent = event;
		}

		for (const listener of listeners) {
			listener(event);
		}
	};

	const updatePublicFileRevisions = (
		previousProject: VirtualProject,
		nextProject: VirtualProject,
	) => {
		const changedPaths = getChangedPublicFilePaths(
			previousProject,
			nextProject,
		);
		for (const path of changedPaths) {
			publicFileRevision++;
			lastModifiedByPath.set(path, publicFileRevision);
		}

		return changedPaths.length > 0;
	};

	const commitProject = ({
		previousProject,
		nextProject,
	}: {
		previousProject: VirtualProject;
		nextProject: VirtualProject;
	}) => {
		const publicFilesChanged = updatePublicFileRevisions(
			previousProject,
			nextProject,
		);
		onProjectChange(nextProject);
		if (publicFilesChanged) {
			emit(getPublicFilesEvent());
		}

		emit(getUndoRedoEvent());
	};

	const applyMutation = ({fileName, mutate}: ProjectMutation) => {
		const before = getProject();
		const after = mutate(before);

		if (after === before) {
			return before;
		}

		undoStack.push({before, after, fileName});
		if (undoStack.length > MAX_HISTORY_ENTRIES) {
			undoStack.shift();
		}

		redoStack.length = 0;
		commitProject({previousProject: before, nextProject: after});
		return after;
	};

	const undo = (): Promise<UndoResponse> => {
		const entry = undoStack.pop();
		if (!entry) {
			return Promise.resolve({success: false, reason: 'Nothing to undo'});
		}

		redoStack.push(entry);
		commitProject({
			previousProject: getProject(),
			nextProject: entry.before,
		});
		return Promise.resolve({success: true});
	};

	const redo = (): Promise<RedoResponse> => {
		const entry = redoStack.pop();
		if (!entry) {
			return Promise.resolve({success: false, reason: 'Nothing to redo'});
		}

		undoStack.push(entry);
		commitProject({
			previousProject: getProject(),
			nextProject: entry.after,
		});
		return Promise.resolve({success: true});
	};

	return {
		applyMutation,
		deleteStaticFile: ({relativePath}) => {
			try {
				const canonicalPath = normalizePublicFilePath(relativePath);
				const publicFiles = getCanonicalPublicFiles(getProject());
				const existed = publicFiles[canonicalPath] !== undefined;
				if (!existed) {
					return Promise.resolve({success: true, existed: false});
				}

				applyMutation({
					fileName: canonicalPath,
					mutate: (project) => {
						const nextPublicFiles = getCanonicalPublicFiles(project);
						delete nextPublicFiles[canonicalPath];
						return {...project, publicFiles: nextPublicFiles};
					},
				});
				return Promise.resolve({success: true, existed: true});
			} catch (error) {
				return Promise.reject(error);
			}
		},
		emitEvent: emit,
		findInFile: (request) => {
			const contents = getFileSource({
				fileName: request.fileName,
				project: getProject(),
			});
			if (contents === null) {
				return Promise.reject(new Error(`Could not find ${request.fileName}`));
			}

			return Promise.resolve(findSearchPosition({...request, contents}));
		},
		getFileSource: (fileName) =>
			Promise.resolve(getFileSource({fileName, project: getProject()})),
		redo,
		resetHistory: () => {
			undoStack.length = 0;
			redoStack.length = 0;
			emit(getUndoRedoEvent());
		},
		renameStaticFile: ({oldRelativePath, newRelativePath}) => {
			try {
				const oldPath = normalizePublicFilePath(oldRelativePath);
				const newPath = normalizePublicFilePath(newRelativePath);
				if (oldPath === newPath) {
					return Promise.resolve({success: true});
				}

				const publicFiles = getCanonicalPublicFiles(getProject());
				if (publicFiles[oldPath] === undefined) {
					throw new Error(`${oldRelativePath} does not exist`);
				}

				if (publicFiles[newPath] !== undefined) {
					throw new Error(`${newRelativePath} already exists`);
				}

				applyMutation({
					fileName: oldPath,
					mutate: (project) => {
						const nextPublicFiles = getCanonicalPublicFiles(project);
						nextPublicFiles[newPath] = nextPublicFiles[oldPath];
						delete nextPublicFiles[oldPath];
						return {...project, publicFiles: nextPublicFiles};
					},
				});
				return Promise.resolve({success: true});
			} catch (error) {
				return Promise.reject(error);
			}
		},
		subscribeToEvent: (listener) => {
			listeners.add(listener);
			listener({
				type: 'init',
				clientId: 'browser-studio',
				undoFile: undoStack.at(-1)?.fileName ?? null,
				redoFile: redoStack.at(-1)?.fileName ?? null,
			});
			listener(getPublicFilesEvent());
			if (latestHmrEvent) {
				listener(latestHmrEvent);
				latestHmrEvent = null;
			}

			return () => {
				listeners.delete(listener);
			};
		},
		undo,
		writeStaticFile: ({contents, filePath}) => {
			try {
				const canonicalPath = normalizePublicFilePath(filePath);
				const nextContents =
					typeof contents === 'string'
						? contents
						: new Uint8Array(contents.slice(0));
				applyMutation({
					fileName: canonicalPath,
					mutate: (project) => ({
						...project,
						publicFiles: {
							...getCanonicalPublicFiles(project),
							[canonicalPath]: nextContents,
						},
					}),
				});
				return Promise.resolve();
			} catch (error) {
				return Promise.reject(error);
			}
		},
	};
};

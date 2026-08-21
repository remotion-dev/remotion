import {findSearchPosition} from '@remotion/studio-codemods';
import type {
	BrowserStudioOperations,
	EventSourceEvent,
	RedoResponse,
	SequenceNodePathMutation,
	SequenceNodePathRemapping,
	UndoResponse,
} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {
	createBrowserStudioProjectStorage,
	getBrowserStudioStoredPublicFile,
	writeBrowserStudioStoredPublicFile,
} from './opfs-public-files';
import type {
	BrowserStudioStoredPublicFile,
	VirtualProject,
	VirtualProjectPublicFile,
} from './types';

type ProjectNodePathMutationFiles = SequenceNodePathMutation['files'];

type HistoryEntry = {
	before: VirtualProject;
	after: VirtualProject;
	fileName: string;
	nodePathMutationFiles: ProjectNodePathMutationFiles | null;
};

type ProjectMutation = {
	fileName: string;
	mutate: (project: VirtualProject) => VirtualProject;
	nodePathMutationFiles: ProjectNodePathMutationFiles | null;
};

const MAX_HISTORY_ENTRIES = 100;

const isStoredPublicFile = (
	contents: VirtualProjectPublicFile,
): contents is BrowserStudioStoredPublicFile =>
	typeof contents === 'object' &&
	!(contents instanceof Uint8Array) &&
	contents.type === 'stored';

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
	const canonicalFiles: Record<string, VirtualProjectPublicFile> = {};

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
	left: VirtualProjectPublicFile | undefined,
	right: VirtualProjectPublicFile | undefined,
) => {
	if (left === right) {
		return true;
	}

	if (left && right && isStoredPublicFile(left) && isStoredPublicFile(right)) {
		return (
			left.key === right.key &&
			left.lastModified === right.lastModified &&
			left.sizeInBytes === right.sizeInBytes
		);
	}

	if (
		typeof left === 'string' ||
		typeof right === 'string' ||
		!(left instanceof Uint8Array) ||
		!(right instanceof Uint8Array)
	) {
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
	left: Record<string, VirtualProjectPublicFile> | undefined,
	right: Record<string, VirtualProjectPublicFile> | undefined,
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
		left.publicFileStorage?.directoryName ===
			right.publicFileStorage?.directoryName &&
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
	getSrc:
		| ((
				name: string,
				contents: VirtualProjectPublicFile,
				project: VirtualProject,
		  ) => Promise<string> | string)
		| null;
	lastModifiedByPath: ReadonlyMap<string, number> | null;
	project: VirtualProject;
}) => {
	return Promise.all(
		Object.entries(getCanonicalPublicFiles(project)).map(
			async ([name, contents]) => ({
				lastModified:
					lastModifiedByPath === null
						? isStoredPublicFile(contents)
							? contents.lastModified
							: 0
						: (lastModifiedByPath.get(name) ?? 0),
				name,
				sizeInBytes:
					typeof contents === 'string'
						? new TextEncoder().encode(contents).byteLength
						: contents instanceof Uint8Array
							? contents.byteLength
							: contents.sizeInBytes,
				src:
					getSrc === null
						? `/${encodePublicFilePath(name)}`
						: await getSrc(name, contents, project),
			}),
		),
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
		{contents: VirtualProjectPublicFile; url: string}
	>();

	const getObjectUrl = async (
		name: string,
		contents: VirtualProjectPublicFile,
		project: VirtualProject,
	) => {
		const existing = objectUrls.get(name);
		if (arePublicFileContentsEqual(existing?.contents, contents)) {
			return existing!.url;
		}

		if (existing) {
			resolvedRevokeObjectUrl(existing.url);
		}

		const blob = isStoredPublicFile(contents)
			? await getBrowserStudioStoredPublicFile({
					file: contents,
					storage:
						project.publicFileStorage ??
						(() => {
							throw new Error(
								`Stored public file ${name} has no project storage`,
							);
						})(),
				})
			: new Blob([
					typeof contents === 'string' ? contents : contents.slice().buffer,
				]);
		const url = resolvedCreateObjectUrl(blob);
		objectUrls.set(name, {
			contents:
				typeof contents === 'string' || isStoredPublicFile(contents)
					? contents
					: contents.slice(),
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
	applyMutation: (mutation: ProjectMutation) => SequenceNodePathMutation | null;
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
}) => Promise<Awaited<ReturnType<typeof getBrowserStudioStaticFiles>>>;

export const createBrowserStudioProjectController = ({
	getStaticFiles,
	getProject,
	onProjectChange,
}: {
	getStaticFiles: BrowserStudioStaticFilesGetter | null;
	getProject: () => VirtualProject;
	onProjectChange: (
		project: VirtualProject,
		metadata: {skipSequencePropsUpdate: boolean},
	) => void;
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
	const nodePathMutationSessionId = `${Date.now()}:${Math.random()}`;
	let nodePathMutationCounter = 0;
	const reportAsyncError = (error: unknown) => {
		setTimeout(() => {
			throw error;
		}, 0);
	};

	const getUndoRedoEvent = (): EventSourceEvent => ({
		type: 'undo-redo-stack-changed',
		undoFile: undoStack.at(-1)?.fileName ?? null,
		redoFile: redoStack.at(-1)?.fileName ?? null,
	});

	const getPublicFilesEvent = async (): Promise<EventSourceEvent> => ({
		type: 'new-public-folder',
		files: await resolvedGetStaticFiles({
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
		nodePathMutationFiles,
	}: {
		previousProject: VirtualProject;
		nextProject: VirtualProject;
		nodePathMutationFiles: ProjectNodePathMutationFiles | null;
	}): SequenceNodePathMutation | null => {
		const publicFilesChanged = updatePublicFileRevisions(
			previousProject,
			nextProject,
		);
		const nodePathMutation = nodePathMutationFiles
			? {
					mutationId: `${nodePathMutationSessionId}:${++nodePathMutationCounter}`,
					files: nodePathMutationFiles,
				}
			: null;
		if (nodePathMutation) {
			emit({type: 'sequence-node-paths-remapped', mutation: nodePathMutation});
		}

		onProjectChange(nextProject, {
			skipSequencePropsUpdate: nodePathMutationFiles !== null,
		});
		if (publicFilesChanged) {
			getPublicFilesEvent().then(emit).catch(reportAsyncError);
		}

		emit(getUndoRedoEvent());
		return nodePathMutation;
	};

	const applyMutation = ({
		fileName,
		mutate,
		nodePathMutationFiles,
	}: ProjectMutation) => {
		const before = getProject();
		const after = mutate(before);

		if (after === before) {
			return null;
		}

		undoStack.push({before, after, fileName, nodePathMutationFiles});
		if (undoStack.length > MAX_HISTORY_ENTRIES) {
			undoStack.shift();
		}

		redoStack.length = 0;
		return commitProject({
			previousProject: before,
			nextProject: after,
			nodePathMutationFiles,
		});
	};

	const undo = (): Promise<UndoResponse> => {
		const entry = undoStack.pop();
		if (!entry) {
			return Promise.resolve({success: false, reason: 'Nothing to undo'});
		}

		redoStack.push(entry);
		const files = entry.nodePathMutationFiles?.map((file) => ({
			absolutePath: file.absolutePath,
			remappings: file.remappings.flatMap(
				(remapping): SequenceNodePathRemapping[] =>
					remapping.newNodePath === null
						? []
						: [
								{
									oldNodePath: remapping.newNodePath,
									newNodePath: remapping.oldNodePath,
								},
							],
			),
			restoredNodePaths: file.remappings.flatMap(
				(remapping): SequenceNodePath[] =>
					remapping.newNodePath === null ? [remapping.oldNodePath] : [],
			),
		}));
		const nodePathMutation = commitProject({
			previousProject: getProject(),
			nextProject: entry.before,
			nodePathMutationFiles: files ?? null,
		});
		return Promise.resolve({success: true, nodePathMutation});
	};

	const redo = (): Promise<RedoResponse> => {
		const entry = redoStack.pop();
		if (!entry) {
			return Promise.resolve({success: false, reason: 'Nothing to redo'});
		}

		undoStack.push(entry);
		const nodePathMutation = commitProject({
			previousProject: getProject(),
			nextProject: entry.after,
			nodePathMutationFiles: entry.nodePathMutationFiles,
		});
		return Promise.resolve({success: true, nodePathMutation});
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
					nodePathMutationFiles: null,
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
					nodePathMutationFiles: null,
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
			getPublicFilesEvent()
				.then((event) => {
					if (listeners.has(listener)) {
						listener(event);
					}
				})
				.catch(reportAsyncError);
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
			return (async () => {
				const canonicalPath = normalizePublicFilePath(filePath);
				const currentProject = getProject();
				const storage =
					currentProject.publicFileStorage ??
					(await createBrowserStudioProjectStorage());
				const nextContents = storage
					? await writeBrowserStudioStoredPublicFile({contents, storage})
					: typeof contents === 'string'
						? contents
						: new Uint8Array(contents.slice(0));
				applyMutation({
					fileName: canonicalPath,
					nodePathMutationFiles: null,
					mutate: (project) => ({
						...project,
						publicFileStorage: storage ?? project.publicFileStorage,
						publicFiles: {
							...getCanonicalPublicFiles(project),
							[canonicalPath]: nextContents,
						},
					}),
				});
			})();
		},
	};
};

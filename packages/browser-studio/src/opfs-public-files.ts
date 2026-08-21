import type {
	BrowserStudioProjectStorage,
	BrowserStudioStoredPublicFile,
} from './types';

const browserStudioDirectoryName = 'remotion-browser-studio';
const projectsDirectoryName = 'projects';
const projectLockPrefix = 'remotion-browser-studio-project:';

type IterableFileSystemDirectoryHandle = FileSystemDirectoryHandle & {
	keys: () => AsyncIterableIterator<string>;
};

type ProjectStorageLease = {
	finished: Promise<void>;
	release: () => void;
};

const projectStorageLeases = new Map<string, ProjectStorageLease>();
let abandonedProjectSweep: Promise<void> | null = null;
let pageHideListenerInstalled = false;

const isNotFoundError = (error: unknown) =>
	error instanceof DOMException && error.name === 'NotFoundError';

const getProjectLockName = (directoryName: string) =>
	`${projectLockPrefix}${directoryName}`;

const getProjectsDirectory = async ({create}: {create: boolean}) => {
	const storage = globalThis.navigator?.storage;
	if (!storage?.getDirectory) {
		return null;
	}

	const root = await storage.getDirectory();
	const browserStudioDirectory = await root.getDirectoryHandle(
		browserStudioDirectoryName,
		{create},
	);
	return browserStudioDirectory.getDirectoryHandle(projectsDirectoryName, {
		create,
	});
};

const getProjectDirectory = async ({
	create,
	storage,
}: {
	create: boolean;
	storage: BrowserStudioProjectStorage;
}) => {
	const projectsDirectory = await getProjectsDirectory({create});
	if (projectsDirectory === null) {
		throw new Error('OPFS is not available in this browser');
	}

	return projectsDirectory.getDirectoryHandle(storage.directoryName, {create});
};

const releaseBrowserStudioProjectStorageLease = async (
	storage: BrowserStudioProjectStorage,
) => {
	const lease = projectStorageLeases.get(storage.directoryName);
	if (!lease) {
		return;
	}

	projectStorageLeases.delete(storage.directoryName);
	lease.release();
	await lease.finished;
};

const removeBrowserStudioProjectStorage = async (
	storage: BrowserStudioProjectStorage,
) => {
	await releaseBrowserStudioProjectStorageLease(storage);
	try {
		const projectsDirectory = await getProjectsDirectory({create: false});
		if (projectsDirectory === null) {
			return;
		}

		await projectsDirectory.removeEntry(storage.directoryName, {
			recursive: true,
		});
	} catch (error) {
		if (!isNotFoundError(error)) {
			throw error;
		}
	}
};

const acquireBrowserStudioProjectStorageLease = async (
	storage: BrowserStudioProjectStorage,
) => {
	if (projectStorageLeases.has(storage.directoryName)) {
		return;
	}

	if (!pageHideListenerInstalled && typeof window !== 'undefined') {
		pageHideListenerInstalled = true;
		window.addEventListener('pagehide', (event) => {
			if (event.persisted) {
				return;
			}

			for (const directoryName of projectStorageLeases.keys()) {
				removeBrowserStudioProjectStorage({
					directoryName,
					type: 'opfs',
				}).catch((error) => {
					setTimeout(() => {
						throw error;
					}, 0);
				});
			}
		});
	}

	const lockManager = globalThis.navigator?.locks;
	if (!lockManager) {
		projectStorageLeases.set(storage.directoryName, {
			finished: Promise.resolve(),
			release: () => undefined,
		});
		return;
	}

	let release: () => void = () => undefined;
	const released = new Promise<void>((resolve) => {
		release = resolve;
	});
	let resolveAcquired: () => void = () => undefined;
	let rejectAcquired: (error: unknown) => void = () => undefined;
	const acquired = new Promise<void>((resolve, reject) => {
		resolveAcquired = resolve;
		rejectAcquired = reject;
	});
	const finished = lockManager.request(
		getProjectLockName(storage.directoryName),
		async () => {
			resolveAcquired();
			await released;
		},
	);
	finished.catch(rejectAcquired);
	await acquired;
	projectStorageLeases.set(storage.directoryName, {finished, release});
};

const sweepAbandonedBrowserStudioProjectStorages = async () => {
	const lockManager = globalThis.navigator?.locks;
	if (!lockManager) {
		return;
	}

	let projectsDirectory: FileSystemDirectoryHandle;
	try {
		const directory = await getProjectsDirectory({create: false});
		if (directory === null) {
			return;
		}

		projectsDirectory = directory;
	} catch (error) {
		if (isNotFoundError(error)) {
			return;
		}

		throw error;
	}

	const names: string[] = [];
	for await (const name of (
		projectsDirectory as IterableFileSystemDirectoryHandle
	).keys()) {
		names.push(name);
	}

	await Promise.all(
		names.map((directoryName) =>
			lockManager.request(
				getProjectLockName(directoryName),
				{ifAvailable: true},
				async (lock) => {
					if (lock === null) {
						return;
					}

					try {
						await projectsDirectory.removeEntry(directoryName, {
							recursive: true,
						});
					} catch (error) {
						if (!isNotFoundError(error)) {
							throw error;
						}
					}
				},
			),
		),
	);
};

export const createBrowserStudioProjectStorage =
	async (): Promise<BrowserStudioProjectStorage | null> => {
		if (!globalThis.navigator?.storage?.getDirectory) {
			return null;
		}

		abandonedProjectSweep ??= sweepAbandonedBrowserStudioProjectStorages();
		await abandonedProjectSweep;

		const storage: BrowserStudioProjectStorage = {
			directoryName: crypto.randomUUID(),
			type: 'opfs',
		};
		await acquireBrowserStudioProjectStorageLease(storage);
		try {
			await getProjectDirectory({create: true, storage});
			return storage;
		} catch (error) {
			await releaseBrowserStudioProjectStorageLease(storage);
			throw error;
		}
	};

export const deleteBrowserStudioProjectStorage = async (
	storage: BrowserStudioProjectStorage,
) => {
	await removeBrowserStudioProjectStorage(storage);
};

export const collectBrowserStudioProjectStorageGarbage = async ({
	referencedKeys,
	storage,
}: {
	referencedKeys: ReadonlySet<string>;
	storage: BrowserStudioProjectStorage;
}) => {
	let projectDirectory: FileSystemDirectoryHandle;
	try {
		projectDirectory = await getProjectDirectory({create: false, storage});
	} catch (error) {
		if (isNotFoundError(error)) {
			return;
		}

		throw error;
	}

	const keys: string[] = [];
	for await (const key of (
		projectDirectory as IterableFileSystemDirectoryHandle
	).keys()) {
		keys.push(key);
	}

	await Promise.all(
		keys.map(async (key) => {
			if (referencedKeys.has(key)) {
				return;
			}

			try {
				await projectDirectory.removeEntry(key);
			} catch (error) {
				if (!isNotFoundError(error)) {
					throw error;
				}
			}
		}),
	);
};

export const writeBrowserStudioStoredPublicFile = async ({
	contents,
	storage,
}: {
	contents:
		| ArrayBuffer
		| Blob
		| ReadableStream<Uint8Array>
		| Uint8Array
		| string;
	storage: BrowserStudioProjectStorage;
}): Promise<BrowserStudioStoredPublicFile> => {
	const projectDirectory = await getProjectDirectory({create: true, storage});
	const key = crypto.randomUUID();
	const handle = await projectDirectory.getFileHandle(key, {create: true});
	const writable = await handle.createWritable();

	if (contents instanceof ReadableStream) {
		await contents.pipeTo(writable);
	} else {
		await writable.write(
			contents instanceof Uint8Array ? contents.slice().buffer : contents,
		);
		await writable.close();
	}

	const file = await handle.getFile();
	return {
		key,
		lastModified: file.lastModified,
		sizeInBytes: file.size,
		type: 'stored',
	};
};

export const getBrowserStudioStoredPublicFile = async ({
	file,
	storage,
}: {
	file: BrowserStudioStoredPublicFile;
	storage: BrowserStudioProjectStorage;
}) => {
	const projectDirectory = await getProjectDirectory({create: false, storage});
	const handle = await projectDirectory.getFileHandle(file.key);
	return handle.getFile();
};

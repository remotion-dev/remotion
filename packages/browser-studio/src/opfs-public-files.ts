import type {
	BrowserStudioProjectStorage,
	BrowserStudioStoredPublicFile,
} from './types';

const browserStudioDirectoryName = 'remotion-browser-studio';
const projectsDirectoryName = 'projects';

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

export const createBrowserStudioProjectStorage =
	async (): Promise<BrowserStudioProjectStorage | null> => {
		if (!globalThis.navigator?.storage?.getDirectory) {
			return null;
		}

		const storage: BrowserStudioProjectStorage = {
			directoryName: crypto.randomUUID(),
			type: 'opfs',
		};
		await getProjectDirectory({create: true, storage});
		return storage;
	};

export const deleteBrowserStudioProjectStorage = async (
	storage: BrowserStudioProjectStorage,
) => {
	const projectsDirectory = await getProjectsDirectory({create: false});
	if (projectsDirectory === null) {
		return;
	}

	await projectsDirectory.removeEntry(storage.directoryName, {recursive: true});
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

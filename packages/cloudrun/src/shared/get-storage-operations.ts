import type {File} from '@google-cloud/storage';
import {readDirectory} from './read-dir';

export const getStorageDiffOperations = async ({
	objects,
	bundle,
	prefix,
}: {
	objects: File[];
	bundle: string;
	prefix: string;
}) => {
	const dir = await readDirectory({
		dir: bundle,
		etags: {},
		originalDir: bundle,
	});

	const filesOnStorageButNotLocal = objects.filter((fileOnStorage) => {
		const key = fileOnStorage.name?.substring(prefix.length) as string;
		return !dir[key];
	});
	const localFilesNotOnStorage = Object.keys(dir).filter((d) => {
		return !objects.find((o) => {
			const key = o.name?.substring(prefix.length) as string;
			return key === d && o.metadata.etag === dir[d];
		});
	});
	const existing = Object.keys(dir).filter((d) => {
		return objects.find((o) => {
			const key = o.name?.substring(prefix.length) as string;
			return key === d && o.metadata.etag === dir[d];
		});
	});

	return {
		toDelete: filesOnStorageButNotLocal,
		toUpload: localFilesNotOnStorage,
		existingCount: existing.length,
	};
};

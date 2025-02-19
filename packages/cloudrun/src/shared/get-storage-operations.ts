import type {File} from '@google-cloud/storage';
import {base64ToHex} from './base64-to-hash';
import {readDirectory} from './read-dir';

const stripPrefix = (file: string, prefix: string) => {
	return file.substring(prefix.length + 1);
};

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

	const hashMap: Record<string, string> = {};
	for (const object of objects) {
		hashMap[object.name] = base64ToHex(object.metadata.md5Hash as string);
	}

	const filesOnStorageButNotLocal = objects.filter((o) => {
		const key = stripPrefix(o.name, prefix);
		return !dir[key];
	});
	const localFilesNotOnStorage = Object.keys(dir).filter((d) => {
		return !objects.find((o) => {
			const key = stripPrefix(o.name, prefix);
			return key === d && hashMap[o.name] === dir[d];
		});
	});
	const existing = Object.keys(dir).filter((d) => {
		return objects.find((o) => {
			const key = stripPrefix(o.name, prefix);
			return key === d && hashMap[o.name] === dir[d];
		});
	});

	return {
		toDelete: filesOnStorageButNotLocal,
		toUpload: localFilesNotOnStorage,
		existingCount: existing.length,
	};
};

import type {_Object} from '@aws-sdk/client-s3';
import {readDirectory} from './read-dir';

export const getS3DiffOperations = async ({
	objects,
	bundle,
	prefix,
}: {
	objects: _Object[];
	bundle: string;
	prefix: string;
}) => {
	const dir = await readDirectory({
		dir: bundle,
		etags: {},
		originalDir: bundle,
	});

	const filesOnS3ButNotLocal = objects.filter((fileOnS3) => {
		const key = fileOnS3.Key?.substring(prefix.length + 1) as string;
		return !dir[key];
	});
	const localFilesNotOnS3 = Object.keys(dir).filter((d) => {
		return !objects.find((o) => {
			const key = o.Key?.substring(prefix.length + 1) as string;
			return key === d && o.ETag === dir[d];
		});
	});
	const existing = Object.keys(dir).filter((d) => {
		return objects.find((o) => {
			const key = o.Key?.substring(prefix.length + 1) as string;
			return key === d && o.ETag === dir[d];
		});
	});

	return {
		toDelete: filesOnS3ButNotLocal,
		toUpload: localFilesNotOnS3,
		existingCount: existing.length,
	};
};

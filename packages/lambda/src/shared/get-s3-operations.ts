import type {_Object} from '@aws-sdk/client-s3';
import type {AwsProvider} from '@remotion/lambda-client';
import type {FullClientSpecifics} from '@remotion/serverless';

const normalizeKey = (key: string) => key.split('\\').join('/');

export const getS3DiffOperations = async ({
	objects,
	bundle,
	prefix,
	onProgress,
	fullClientSpecifics,
}: {
	objects: _Object[];
	bundle: string;
	prefix: string;
	onProgress: (bytes: number) => void;
	fullClientSpecifics: FullClientSpecifics<AwsProvider>;
}) => {
	let totalBytes = 0;
	const dir = fullClientSpecifics.readDirectory({
		dir: bundle,
		etags: {},
		originalDir: bundle,
		onProgress: (bytes) => {
			totalBytes += bytes;
			onProgress(totalBytes);
		},
	});
	const normalizedDir = Object.fromEntries(
		Object.entries(dir).map(([key, value]) => [normalizeKey(key), value]),
	);

	const filesOnS3ButNotLocal: _Object[] = [];
	for (const fileOnS3 of objects) {
		const key = normalizeKey(
			fileOnS3.Key?.substring(prefix.length + 1) as string,
		);
		if (!normalizedDir[key]) {
			filesOnS3ButNotLocal.push(fileOnS3);
		}
	}

	const localFilesNotOnS3: string[] = [];
	for (const d of Object.keys(normalizedDir)) {
		const normalizedLocalKey = normalizeKey(d);
		let found: _Object | undefined;
		for (const o of objects) {
			const key = normalizeKey(o.Key?.substring(prefix.length + 1) as string);
			if (key === normalizedLocalKey && o.ETag === (await normalizedDir[d]())) {
				found = o;
				break;
			}
		}

		if (!found) {
			localFilesNotOnS3.push(normalizedLocalKey);
		}
	}

	const existing: string[] = [];
	for (const d of Object.keys(normalizedDir)) {
		const normalizedLocalKey = normalizeKey(d);
		for (const o of objects) {
			const key = normalizeKey(o.Key?.substring(prefix.length + 1) as string);
			if (key === normalizedLocalKey && o.ETag === (await normalizedDir[d]())) {
				existing.push(normalizedLocalKey);
				break;
			}
		}
	}

	return {
		toDelete: filesOnS3ButNotLocal,
		toUpload: localFilesNotOnS3,
		existingCount: existing.length,
	};
};

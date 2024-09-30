import type {Dirent} from 'fs';
import {createReadStream, promises as fs} from 'fs';
import path from 'path';
import {makeStorageKey} from '../shared/make-storage-key';
import {getCloudStorageClient} from './helpers/get-cloud-storage-client';

type FileInfo = {
	name: string;
	size: number;
};

export type UploadDirProgress = {
	totalFiles: number;
	filesUploaded: number;
	totalSize: number;
	sizeUploaded: number;
};

export type MockFile = {
	name: string;
	content: string;
};

export const getDirFiles = (entry: string): MockFile[] => {
	throw new TypeError(
		'should only be executed in test ' + JSON.stringify(entry),
	);
};

export const uploadDir = async ({
	bucket,
	localDir,
	onProgress,
	keyPrefix,
	toUpload,
}: {
	bucket: string;
	localDir: string;
	keyPrefix: string;
	onProgress: (progress: UploadDirProgress) => void;
	toUpload: string[];
}) => {
	async function getFiles(
		directory: string,
		originalDirectory: string,
		filesToUpload: string[],
	): Promise<FileInfo[]> {
		const dirents = await fs.readdir(directory, {withFileTypes: true});
		const _files = await Promise.all(
			dirents
				.map((dirent): [Dirent, string] => {
					const res = path.resolve(directory, dirent.name);
					return [dirent, res];
				})
				.filter(([dirent, res]) => {
					const relative = path.relative(originalDirectory, res);
					if (dirent.isDirectory()) {
						return true;
					}

					if (!filesToUpload.includes(relative)) {
						return false;
					}

					return true;
				})
				.map(async ([dirent, res]) => {
					const {size} = await fs.stat(res);
					return dirent.isDirectory()
						? getFiles(res, originalDirectory, filesToUpload)
						: [
								{
									name: res,
									size,
								},
							];
				}),
		);
		return _files.flat(1);
	}

	const files = await getFiles(localDir, localDir, toUpload);
	const progresses: {[key: string]: number} = {};
	for (const file of files) {
		progresses[file.name] = 0;
	}

	const cloudStorageClient = getCloudStorageClient();

	const uploads = files.map((file) => {
		const filePath = file.name;
		const destination = makeStorageKey(keyPrefix, localDir, filePath);
		return new Promise((resolve, reject) => {
			createReadStream(filePath)
				.pipe(
					cloudStorageClient
						.bucket(bucket)
						.file(destination)
						.createWriteStream({public: true}),
				)
				.on('error', (error) => reject(error))
				.on('progress', (p) => {
					progresses[filePath] = p.bytesWritten ?? 0;
				})
				.on('finish', () => resolve('done'));
		});
	});

	const promise = Promise.all(uploads);

	const interval = setInterval(() => {
		onProgress({
			totalSize: files.map((f) => f.size).reduce((a, b) => a + b, 0),
			sizeUploaded: Object.values(progresses).reduce((a, b) => a + b, 0),
			totalFiles: files.length,
			filesUploaded: files.filter((f) => progresses[f.name] === f.size).length,
		});
	}, 1000);
	await promise;
	clearInterval(interval);
};

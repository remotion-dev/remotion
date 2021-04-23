import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {createReadStream, promises as fs} from 'fs';
import path from 'path';

export const uploadDir = async ({
	bucket,
	client,
	dir,
}: {
	bucket: string;
	client: S3Client;
	dir: string;
}) => {
	async function getFiles(directory: string): Promise<string | string[]> {
		const dirents = await fs.readdir(directory, {withFileTypes: true});
		const _files = await Promise.all(
			dirents.map((dirent) => {
				const res = path.resolve(directory, dirent.name);
				return dirent.isDirectory() ? getFiles(res) : res;
			})
		);
		return Array.prototype.concat(..._files);
	}

	const files = (await getFiles(dir)) as string[];
	const uploads = files.map((filePath) => {
		return client.send(
			new PutObjectCommand({
				Key: path.relative(dir, filePath),
				Bucket: bucket,
				Body: createReadStream(filePath),
				ACL: 'public-read',
				ContentType: filePath.includes('index.html') ? 'text/html' : undefined,
			})
		);
	});
	return Promise.all(uploads);
};

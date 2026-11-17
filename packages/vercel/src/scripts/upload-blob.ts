import {readFileSync, statSync} from 'fs';
import {put} from '@vercel/blob';
import type {VercelBlobAccess} from '../types';

type UploadBlobConfig = {
	sandboxFilePath: string;
	blobPath: string;
	contentType: string;
	access: VercelBlobAccess;
};

const config: UploadBlobConfig = JSON.parse(process.argv[2]);

try {
	const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
	if (!blobToken) {
		throw new Error('BLOB_READ_WRITE_TOKEN is not set.');
	}

	const fileBuffer = readFileSync(config.sandboxFilePath);
	const size = statSync(config.sandboxFilePath).size;
	const blob = await put(config.blobPath, fileBuffer, {
		access: config.access,
		contentType: config.contentType,
		token: blobToken,
	});

	console.log(
		JSON.stringify({
			type: 'done',
			url: blob.downloadUrl,
			size,
		}),
	);
} catch (err) {
	console.error((err as Error).message);
	process.exit(1);
}

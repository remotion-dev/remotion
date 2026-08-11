import type {Sandbox} from '@vercel/sandbox';
import type {VercelBlobAccess} from './types';

function getExtension(filePath: string): string {
	const lastDot = filePath.lastIndexOf('.');
	if (lastDot === -1) {
		return '';
	}

	return filePath.slice(lastDot);
}

export async function uploadToVercelBlob({
	sandbox,
	sandboxFilePath,
	blobPath,
	contentType,
	blobToken,
	access,
}: {
	sandbox: Sandbox;
	sandboxFilePath: string;
	blobPath?: string;
	contentType: string;
	blobToken: string;
	access: VercelBlobAccess;
}): Promise<{url: string; size: number}> {
	const actualBlobPath =
		blobPath ??
		`renders/${crypto.randomUUID()}${getExtension(sandboxFilePath)}`;

	const uploadConfig = {
		sandboxFilePath,
		blobPath: actualBlobPath,
		contentType,
		blobToken,
		access,
	};

	const uploadCmd = await sandbox.runCommand({
		cmd: 'node',
		args: ['upload-blob.mjs', JSON.stringify(uploadConfig)],
		detached: true,
	});

	let result: {url: string; size: number} | null = null;

	for await (const log of uploadCmd.logs()) {
		if (log.stream === 'stdout') {
			try {
				const message = JSON.parse(log.data);
				if (message.type === 'done') {
					result = {url: message.url, size: message.size};
				}
			} catch {
				// Not JSON, ignore
			}
		}
	}

	const uploadResult = await uploadCmd.wait();
	if (uploadResult.exitCode !== 0) {
		const stderr = await uploadResult.stderr();
		const stdout = await uploadResult.stdout();
		throw new Error(`Upload failed: ${stderr} ${stdout}`);
	}

	if (!result) {
		throw new Error('Upload script did not return result');
	}

	return result;
}

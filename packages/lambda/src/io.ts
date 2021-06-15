import {
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	_Object,
} from '@aws-sdk/client-s3';
import {
	createWriteStream,
	existsSync,
	mkdirSync,
	promises,
	ReadStream,
} from 'fs';
import {Readable} from 'stream';
import {s3Client} from './aws-clients';
import {EFS_MOUNT_PATH, ENABLE_EFS} from './constants';

const ensureDir = async ({bucketName}: {bucketName: string}) => {
	if (ENABLE_EFS) {
		if (!existsSync(EFS_MOUNT_PATH + '/' + bucketName)) {
			mkdirSync(EFS_MOUNT_PATH + '/' + bucketName);
		}
	}
};

export const lambdaLs = async ({
	bucketName,
	forceS3,
	prefix,
}: {
	bucketName: string;
	prefix: string;
	forceS3: boolean;
}): Promise<_Object[]> => {
	await ensureDir({bucketName});

	const list = await s3Client.send(
		new ListObjectsV2Command({
			Bucket: bucketName,
			Prefix: prefix,
		})
	);
	return list.Contents ?? [];
};

export const lambdaWriteFile = async ({
	bucketName,
	key,
	body,
	forceS3,
}: {
	bucketName: string;
	key: string;
	body: ReadStream | string;
	forceS3: boolean;
}): Promise<void> => {
	await ensureDir({bucketName});

	if (ENABLE_EFS && !forceS3) {
		if (typeof body === 'string') {
			return promises.writeFile(
				EFS_MOUNT_PATH + '/' + bucketName + '/' + key,
				body
			);
		}

		return new Promise<void>((resolve, reject) => {
			body
				.pipe(createWriteStream(EFS_MOUNT_PATH + '/' + bucketName + '/' + key))
				.on('close', () => resolve())
				.on('error', (err) => reject(err));
		});
	}

	await s3Client.send(
		new PutObjectCommand({
			Bucket: bucketName,
			Key: key,
			Body: body,
			// TODO: should not be default
			ACL: 'public-read',
		})
	);
};

export const lambdaReadFile = async ({
	bucketName,
	key,
}: {
	bucketName: string;
	key: string;
}): Promise<Readable | Buffer> => {
	await ensureDir({bucketName});

	if (ENABLE_EFS) {
		return promises.readFile(EFS_MOUNT_PATH + '/' + bucketName + '/' + key);
	}

	const {Body} = await s3Client.send(
		new GetObjectCommand({
			Bucket: bucketName,
			Key: key,
		})
	);
	return Body as Readable;
};

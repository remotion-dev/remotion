import type {AwsProvider, AwsRegion} from '@remotion/lambda-client';
import type {
	BucketWithLocation,
	CloudProvider,
	Privacy,
} from '@remotion/serverless';
import {Readable} from 'stream';

export const mockBucketStore: BucketWithLocation<AwsProvider>[] = [];

type S3MockFile<Provider extends CloudProvider> = {
	bucketName: string;
	region: Provider['region'];
	acl: 'public-read' | 'private' | 'none';
	key: string;
	content: Uint8Array;
};

let mockS3Store: S3MockFile<AwsProvider>[] = [];

export const addMockBucket = (bucket: BucketWithLocation<AwsProvider>) => {
	mockBucketStore.push(bucket);
};

export const getMockBuckets = () => {
	return mockBucketStore;
};

export const mockBucketExists = (bucketName: string, region: string) => {
	return Boolean(
		mockBucketStore.find((s) => s.name === bucketName && s.region === region),
	);
};

export const resetMockStore = () => {
	mockBucketStore.length = 0;
	mockS3Store.length = 0;
};

export const getS3FilesInBucket = ({
	bucketName,
	region,
}: {
	bucketName: string;
	region: string;
}) => {
	const list = mockS3Store.filter(
		(s) => s.bucketName === bucketName && s.region === region,
	);
	return list;
};

export function streamToUint8Array(
	obj: Readable | string | Uint8Array,
): Promise<Uint8Array> {
	return new Promise<Uint8Array>((resolve, reject) => {
		if (obj instanceof Readable) {
			let data = Uint8Array.from([]);

			obj.on('data', (chunk) => {
				data = Uint8Array.from([...data, ...chunk]);
			});

			obj.on('end', () => {
				resolve(data);
			});

			obj.on('error', (err) => {
				reject(err);
			});
		} else if (typeof obj === 'string') {
			resolve(Uint8Array.from(Buffer.from(obj)));
		} else {
			resolve(obj);
		}
	});
}

export const writeMockS3File = async ({
	body,
	privacy,
	bucketName,
	key,
	region,
}: {
	body: string | Readable | Uint8Array;
	privacy: Privacy;
	bucketName: string;
	key: string;
	region: AwsRegion;
}) => {
	mockS3Store = mockS3Store.filter((m) => {
		return !(
			m.region === region &&
			m.bucketName === bucketName &&
			m.key === key
		);
	});
	const content = await streamToUint8Array(body);
	mockS3Store.push({
		content,
		acl:
			privacy === 'no-acl'
				? 'none'
				: privacy === 'public'
					? 'public-read'
					: 'private',
		bucketName,
		key,
		region,
	});
};

export const readMockS3File = ({
	region,
	key,
	bucketName,
}: {
	region: AwsRegion;
	key: string;
	bucketName: string;
}) => {
	return mockS3Store.find(
		(s) => s.key === key && s.region === region && s.bucketName === bucketName,
	);
};

export const mockDeleteS3File = <Provider extends CloudProvider>({
	key,
	region,
	bucketName,
}: {
	key: string;
	region: Provider['region'];
	bucketName: string;
}) => {
	mockS3Store = mockS3Store.filter(
		(s) =>
			!(s.bucketName === bucketName && s.key === key && s.region === region),
	);
};

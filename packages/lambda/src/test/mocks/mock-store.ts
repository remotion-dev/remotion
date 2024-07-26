import type {Privacy} from '@remotion/serverless/client';
import type {ReadStream} from 'node:fs';
import type {BucketWithLocation} from '../../api/get-buckets';
import type {AwsRegion} from '../../regions';

export const mockBucketStore: BucketWithLocation[] = [];

type S3MockFile = {
	bucketName: string;
	region: AwsRegion;
	acl: 'public-read' | 'private' | 'none';
	key: string;
	content: string | ReadStream;
};

let mockS3Store: S3MockFile[] = [];

export const addMockBucket = (bucket: BucketWithLocation) => {
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

export const getS3FilesInBucket = ({
	bucketName,
	region,
}: {
	bucketName: string;
	region: string;
}) => {
	return mockS3Store.filter(
		(s) => s.bucketName === bucketName && s.region === region,
	);
};

export const writeMockS3File = ({
	body,
	privacy,
	bucketName,
	key,
	region,
}: {
	body: string | ReadStream;
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
	mockS3Store.push({
		content: body,
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

export const mockDeleteS3File = ({
	key,
	region,
	bucketName,
}: {
	key: string;
	region: AwsRegion;
	bucketName: string;
}) => {
	mockS3Store = mockS3Store.filter(
		(s) =>
			!(s.bucketName === bucketName && s.key === key && s.region === region),
	);
};

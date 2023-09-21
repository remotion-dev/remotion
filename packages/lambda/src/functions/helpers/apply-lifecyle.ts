import type {
	DeleteBucketLifecycleCommandInput,
	LifecycleRule,
	PutBucketLifecycleConfigurationCommandInput,
} from '@aws-sdk/client-s3';

export const deleteLifeCycleInput = ({
	bucketName,
}: {
	bucketName: string;
}): DeleteBucketLifecycleCommandInput => {
	return {
		Bucket: bucketName,
	};
};

export const createLifeCycleInput = ({
	bucketName,
	lcRules,
}: {
	bucketName: string;
	lcRules: LifecycleRule[];
}): PutBucketLifecycleConfigurationCommandInput => {
	return {
		Bucket: bucketName,
		LifecycleConfiguration: {
			Rules: lcRules,
		},
	};
};

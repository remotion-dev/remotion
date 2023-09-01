import type {
	DeleteBucketLifecycleCommandInput,
	LifecycleRule,
	PutBucketLifecycleConfigurationCommandInput,
} from '@aws-sdk/client-s3';

export const deleteLifeCycleInput = ({
	bucketName,
	lcRules,
}: {
	bucketName: string;
	lcRules: LifecycleRule[];
}): DeleteBucketLifecycleCommandInput => {
	return {
		Bucket: bucketName,
		LifecycleConfiguration: {
			Rules: lcRules,
		},
	} as DeleteBucketLifecycleCommandInput;
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
	} as PutBucketLifecycleConfigurationCommandInput;
};

import {
	DeleteBucketLifecycleCommand,
	PutBucketLifecycleConfigurationCommand,
} from '@aws-sdk/client-s3';
import type {AwsRegion} from '../client';
import {
	createLifeCycleInput,
	deleteLifeCycleInput,
} from '../functions/helpers/apply-lifecyle';
import {getLifeCycleRules} from '../functions/helpers/lifecycle';
import {getS3Client} from './aws-clients';

export const createLCRules = async ({
	bucketName,
	region,
}: {
	bucketName: string;
	region: AwsRegion;
}) => {
	const lcRules = getLifeCycleRules();
	// create the lifecyle rules
	const createCommandInput = createLifeCycleInput({
		bucketName,
		lcRules,
	});
	const createCommand = new PutBucketLifecycleConfigurationCommand(
		createCommandInput,
	);
	await getS3Client(region, null).send(createCommand);
};

export const applyLifeCyleOperation = async ({
	enableFolderExpiry,
	bucketName,
	region,
}: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: AwsRegion;
}) => {
	if (enableFolderExpiry === null) {
		return;
	}

	if (enableFolderExpiry === true) {
		await createLCRules({bucketName, region});
	} else {
		await deleteLCRules({bucketName, region});
	}
};

export const deleteLCRules = async ({
	bucketName,
	region,
}: {
	bucketName: string;
	region: AwsRegion;
}) => {
	const lcRules = getLifeCycleRules();
	const deleteCommandInput = deleteLifeCycleInput({
		bucketName,
		lcRules,
	});
	const deleteCommand = new DeleteBucketLifecycleCommand(deleteCommandInput);
	await getS3Client(region, null).send(deleteCommand);
};

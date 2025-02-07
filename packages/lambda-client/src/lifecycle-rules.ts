import {
	DeleteBucketLifecycleCommand,
	PutBucketLifecycleConfigurationCommand,
} from '@aws-sdk/client-s3';
import type {CustomCredentials} from '@remotion/serverless-client';
import {createLifeCycleInput, deleteLifeCycleInput} from './apply-lifecycle';
import type {AwsProvider} from './aws-provider';
import {getS3Client} from './get-s3-client';
import {getLifeCycleRules} from './lifecycle';
import type {AwsRegion} from './regions';

const createLCRules = async ({
	bucketName,
	region,
	customCredentials,
	forcePathStyle,
}: {
	bucketName: string;
	region: AwsRegion;
	customCredentials: CustomCredentials<AwsProvider> | null;
	forcePathStyle: boolean;
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
	try {
		await getS3Client({region, customCredentials, forcePathStyle}).send(
			createCommand,
		);
	} catch (err) {
		if ((err as Error).stack?.includes('AccessDenied')) {
			throw new Error(
				`You don't have the required permissions to create lifecycle rules on the bucket "${bucketName}", but the "enableFolderExpiry" was set to true. Ensure that your user has the "s3:PutLifecycleConfiguration" permission.`,
			);
		}
	}
};

const deleteLCRules = async ({
	bucketName,
	region,
	customCredentials,
	forcePathStyle,
}: {
	bucketName: string;
	region: AwsRegion;
	customCredentials: CustomCredentials<AwsProvider> | null;
	forcePathStyle: boolean;
}) => {
	const deleteCommandInput = deleteLifeCycleInput({
		bucketName,
	});
	try {
		await getS3Client({region, customCredentials, forcePathStyle}).send(
			new DeleteBucketLifecycleCommand(deleteCommandInput),
		);
	} catch (err) {
		if ((err as Error).stack?.includes('AccessDenied')) {
			throw new Error(
				`You don't have the required permissions to delete lifecycle rules on the bucket "${bucketName}", but the "enableFolderExpiry" option was set to "false". Ensure that your user has the "s3:PutLifecycleConfiguration" permission. Set "enableFolderExpiry" to "null" to not overwrite any existing lifecycle rules.`,
			);
		}
	}
};

export const applyLifeCyleOperation = async ({
	enableFolderExpiry,
	bucketName,
	region,
	customCredentials,
	forcePathStyle,
}: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: AwsRegion;
	customCredentials: CustomCredentials<AwsProvider> | null;
	forcePathStyle: boolean;
}) => {
	if (enableFolderExpiry === null) {
		return;
	}

	if (enableFolderExpiry === true) {
		await createLCRules({
			bucketName,
			region,
			customCredentials,
			forcePathStyle,
		});
	} else {
		await deleteLCRules({
			bucketName,
			region,
			customCredentials,
			forcePathStyle,
		});
	}
};

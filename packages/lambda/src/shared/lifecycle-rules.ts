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
import type {CustomCredentials} from './aws-clients';
import {getS3Client} from './aws-clients';

const createLCRules = async ({
	bucketName,
	region,
	customCredentials,
}: {
	bucketName: string;
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
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
		await getS3Client(region, customCredentials).send(createCommand);
	} catch (err) {
		if ((err as Error).message.includes('AccessDenied')) {
			throw new Error(
				`You don't have the required permissions to create lifecycle rules on the bucket "${bucketName}". Ensure that your user has the "s3:PutLifecycleConfiguration" permission.`,
			);
		}

		console.log({err});
	}
};

const deleteLCRules = async ({
	bucketName,
	region,
	customCredentials,
}: {
	bucketName: string;
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
}) => {
	const deleteCommandInput = deleteLifeCycleInput({
		bucketName,
	});
	try {
		await getS3Client(region, customCredentials).send(
			new DeleteBucketLifecycleCommand(deleteCommandInput),
		);
	} catch (err) {
		if ((err as Error).message.includes('AccessDenied')) {
			throw new Error(
				`You don't have the required permissions to delete lifecycle rules on the bucket "${bucketName}". Ensure that your user has the "s3:PutLifecycleConfiguration" permission.`,
			);
		}

		console.log({err});
	}
};

export const applyLifeCyleOperation = async ({
	enableFolderExpiry,
	bucketName,
	region,
	customCredentials,
}: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
}) => {
	if (enableFolderExpiry === null) {
		return;
	}

	if (enableFolderExpiry === true) {
		await createLCRules({bucketName, region, customCredentials});
	} else {
		await deleteLCRules({bucketName, region, customCredentials});
	}
};

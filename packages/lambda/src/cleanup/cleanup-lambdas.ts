import {AwsRegion} from '..';
import {deleteFunction} from '../api/delete-function';
import {getFunctions} from '../api/get-functions';

export const cleanupLambdas = async ({
	onBeforeDelete,
	onAfterDelete,
	region,
}: {
	region: AwsRegion;
	onBeforeDelete?: (lambdaName: string) => void;
	onAfterDelete?: (lambdaName: string) => void;
}) => {
	const remotionLambdas = await getFunctions({region, compatibleOnly: false});
	if (remotionLambdas.length === 0) {
		return;
	}

	for (const lambda of remotionLambdas) {
		onBeforeDelete?.(lambda.name);
		await deleteFunction({
			region,
			functionName: lambda.name,
		});
		onAfterDelete?.(lambda.name);
	}

	await cleanupLambdas({region, onBeforeDelete, onAfterDelete});
};

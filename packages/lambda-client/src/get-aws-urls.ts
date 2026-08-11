import type {
	GetLoggingUrlForRendererFunction,
	ServerlessRoutines,
} from '@remotion/serverless-client';
import type {AwsProvider} from './aws-provider';
import {encodeAwsUrlParams} from './encode-aws-url-params';
import type {AwsRegion} from './regions';

const cloudWatchUrlWithQuery = ({
	region,
	functionNameToUse,
	query,
}: {
	region: AwsRegion;
	functionNameToUse: string;
	query: string;
}) => {
	return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/$252Faws$252Flambda$252F${functionNameToUse}/log-events$3FfilterPattern$3D${encodeAwsUrlParams(
		query,
	)}`;
};

export const getCloudwatchMethodUrl = ({
	region,
	functionName,
	renderId,
	rendererFunctionName,
	method,
}: {
	region: AwsRegion;
	functionName: string;
	method: ServerlessRoutines;
	rendererFunctionName: string | null;
	renderId: string;
}) => {
	const functionNameToUse = rendererFunctionName ?? functionName;
	const query = `"method=${method},renderId=${renderId}"`;

	return cloudWatchUrlWithQuery({region, functionNameToUse, query});
};

export const getLambdaInsightsUrl = ({
	region,
	functionName,
}: {
	region: AwsRegion;
	functionName: string;
}) => {
	return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#lambda-insights:functions/${functionName}`;
};

export const getCloudwatchRendererUrl: GetLoggingUrlForRendererFunction<
	AwsProvider
> = ({region, functionName, renderId, rendererFunctionName, chunk}) => {
	const functionNameToUse = rendererFunctionName ?? functionName;
	const query = `"method=renderer,renderId=${renderId}${
		chunk === null ? '' : `,chunk=${chunk},`
	}"`;

	return cloudWatchUrlWithQuery({region, functionNameToUse, query});
};

export const getS3RenderUrl = ({
	renderId,
	region,
	bucketName,
}: {
	renderId: string;
	region: AwsRegion;
	bucketName: string;
}) => {
	return `https://s3.console.aws.amazon.com/s3/buckets/${bucketName}?region=${region}&prefix=renders/${renderId}/`;
};

export const getProgressJsonUrl = ({
	region,
	bucketName,
	renderId,
}: {
	region: AwsRegion;
	bucketName: string;
	renderId: string;
}) => {
	return `https://${region}.console.aws.amazon.com/s3/object/${bucketName}?region=${region}&bucketType=general&prefix=renders/${renderId}/progress.json`;
};

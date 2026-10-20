import type {LambdaClient} from '@aws-sdk/client-lambda';
import type {AwsRegion} from './regions';
import type {ServerlessPayloads, ServerlessRoutines} from './shared-constants';

// Extract RequestHandler type from AWS SDK LambdaClient constructor
type LambdaClientConfig = NonNullable<
	ConstructorParameters<typeof LambdaClient>[0]
>;
export type RequestHandler = LambdaClientConfig['requestHandler'];

export type ReceivedArtifact = {
	filename: string;
	sizeInBytes: number;
	s3Url: string;
	s3Key: string;
};

export type CostsInfo = {
	accruedSoFar: number;
	displayCost: string;
	currency: string;
	disclaimer: string;
};

export type RenderStillFunctionResponsePayload = {
	type: 'success';
	output: string;
	outKey: string;
	size: number;
	bucketName: string;
	sizeInBytes: number;
	estimatedPrice: CostsInfo;
	renderId: string;
	receivedArtifacts: ReceivedArtifact[];
};

export type ChunkRetry = {
	chunk: number;
	attempt: number;
	time: number;
};

export type ParsedTiming = {
	chunk: number;
	start: number;
	rendered: number;
};

export type CallFunctionOptions<T extends ServerlessRoutines> = {
	functionName: string;
	type: T;
	payload: ServerlessPayloads[T];
	region: AwsRegion;
	timeoutInTest: number;
	requestHandler: RequestHandler | null;
};

export type ObjectChunkTimingData = {
	chunk: number;
	frameRange: [number, number];
	startDate: number;
	timings: {
		[key: number]: number;
	};
};

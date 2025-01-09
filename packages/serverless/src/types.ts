import type {ServerlessPayloads, ServerlessRoutines} from './constants';

export interface CloudProvider<
	Region extends string = string,
	ReceivedArtifactType extends Record<string, unknown> = Record<
		string,
		unknown
	>,
	CreateFunctionSpecifics extends Record<string, unknown> = Record<
		string,
		unknown
	>,
> {
	type: string;
	region: Region;
	receivedArtifactType: ReceivedArtifactType;
	creationFunctionOptions: CreateFunctionSpecifics;
}

export type ReceivedArtifact<Provider extends CloudProvider> = {
	filename: string;
	sizeInBytes: number;
	s3Url: string;
	s3Key: string;
} & Provider['receivedArtifactType'];

export type CostsInfo = {
	accruedSoFar: number;
	displayCost: string;
	currency: string;
	disclaimer: string;
};

export type RenderStillFunctionResponsePayload<Provider extends CloudProvider> =
	{
		type: 'success';
		output: string;
		outKey: string;
		size: number;
		bucketName: string;
		sizeInBytes: number;
		estimatedPrice: CostsInfo;
		renderId: string;
		receivedArtifacts: ReceivedArtifact<Provider>[];
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

export type CallFunctionOptions<
	T extends ServerlessRoutines,
	Provider extends CloudProvider,
> = {
	functionName: string;
	type: T;
	payload: ServerlessPayloads<Provider>[T];
	region: Provider['region'];
	timeoutInTest: number;
};

export type ObjectChunkTimingData = {
	chunk: number;
	frameRange: [number, number];
	startDate: number;
	timings: {
		[key: number]: number;
	};
};

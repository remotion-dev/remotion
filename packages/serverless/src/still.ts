export interface CloudProvider<
	Region extends string = string,
	ReceivedArtifactType extends Record<string, unknown> = Record<
		string,
		unknown
	>,
> {
	type: string;
	region: Region;
	receivedArtifactType: ReceivedArtifactType;
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

export type RenderStillLambdaResponsePayload<Provider extends CloudProvider> = {
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

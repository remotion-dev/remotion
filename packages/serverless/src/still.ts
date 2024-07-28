// TODO: Should not use AWS terminology here
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

export type RenderStillLambdaResponsePayload = {
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

export interface CloudProvider<T extends string = string> {
	type: string;
	region: T;
}

// TODO: Should not use AWS terminology here
export type ReceivedArtifact<Provider extends CloudProvider> = {
	filename: string;
	sizeInBytes: number;
	s3Url: string;
	s3Key: string;
} & (Provider['type'] extends 'aws'
	? {
			s3Url: string;
			s3Key: string;
		}
	: {
			cloudStorageUrl: string;
			cloudStorageKey: string;
		});

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

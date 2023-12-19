export type RequestContext = {
	invokedFunctionArn: string;
	getRemainingTimeInMillis: () => number;
	awsRequestId: string;
};

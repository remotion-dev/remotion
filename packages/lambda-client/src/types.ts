import type {LambdaClient} from '@aws-sdk/client-lambda';

// Extract RequestHandler type from AWS SDK LambdaClient constructor
type LambdaClientConfig = NonNullable<
	ConstructorParameters<typeof LambdaClient>[0]
>;
export type RequestHandler = LambdaClientConfig['requestHandler'];

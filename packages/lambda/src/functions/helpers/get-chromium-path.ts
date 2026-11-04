import {LambdaClientInternals} from '@remotion/lambda-client';

// Inside the Lambda function, Chromium is provided by the Remotion layer.
// Outside of it (tests, local simulation), let the renderer resolve a browser.
export const getChromiumPath = (): string | null => {
	return LambdaClientInternals.isInsideLambda() ? '/opt/bin/chromium' : null;
};

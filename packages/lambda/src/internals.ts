import {
	getRenderProgressPayload,
	makeLambdaRenderMediaPayload,
	makeLambdaRenderStillPayload,
} from './api/make-lambda-payload';
import {executeCommand} from './cli/index';

export const LambdaInternals = {
	executeCommand,
	makeLambdaRenderMediaPayload,
	getRenderProgressPayload,
	makeLambdaRenderStillPayload,
};

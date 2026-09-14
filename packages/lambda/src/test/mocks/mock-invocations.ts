import type {ServerlessRoutines} from '@remotion/serverless';

const invocationTypesByRender = new Map<string, ServerlessRoutines[]>();

export const trackMockInvocation = (payload: {
	type: ServerlessRoutines;
	renderId?: string;
}) => {
	if (!payload.renderId) {
		return;
	}

	const invocations = invocationTypesByRender.get(payload.renderId) ?? [];
	invocations.push(payload.type);
	invocationTypesByRender.set(payload.renderId, invocations);
};

export const getMockInvocationTypesForRender = (renderId: string) => {
	return invocationTypesByRender.get(renderId) ?? [];
};

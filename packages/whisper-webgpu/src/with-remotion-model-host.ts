import type {env, ModelRegistry, pipeline} from '@huggingface/transformers';

const REMOTION_MODEL_HOST = 'https://remotion.media/';
const REMOTION_MODEL_PATH_TEMPLATE = 'models/{model}/';
const REMOTION_MODEL_HOST_STATE = Symbol.for(
	'@remotion/whisper-webgpu/model-host-state',
);

type TransformersModule = {
	readonly env: typeof env;
	readonly ModelRegistry: typeof ModelRegistry;
	readonly pipeline: typeof pipeline;
};

type ModelHostState = {
	activeOperations: number;
	previousRemoteConfiguration: {
		remoteHost: string;
		remotePathTemplate: string;
	} | null;
};

export const withRemotionModelHost = async <ReturnValue>(
	operation: (transformers: TransformersModule) => Promise<ReturnValue>,
): Promise<ReturnValue> => {
	// Transformers.js is an external peer so AI workflows in the same application
	// can share one version. Keep Remotion's host override scoped to this operation.
	const transformers = await import('@huggingface/transformers');
	const {env} = transformers;
	const environmentWithState = env as typeof env &
		Record<symbol, ModelHostState | undefined>;
	let state = environmentWithState[REMOTION_MODEL_HOST_STATE];
	if (!state) {
		state = {
			activeOperations: 0,
			previousRemoteConfiguration: null,
		};
		Object.defineProperty(environmentWithState, REMOTION_MODEL_HOST_STATE, {
			value: state,
		});
	}

	if (state.activeOperations === 0) {
		state.previousRemoteConfiguration = {
			remoteHost: env.remoteHost,
			remotePathTemplate: env.remotePathTemplate,
		};
		env.remoteHost = REMOTION_MODEL_HOST;
		env.remotePathTemplate = REMOTION_MODEL_PATH_TEMPLATE;
	}

	state.activeOperations++;
	try {
		return await operation(transformers);
	} finally {
		state.activeOperations--;
		if (state.activeOperations === 0) {
			const configurationToRestore = state.previousRemoteConfiguration;
			state.previousRemoteConfiguration = null;
			if (configurationToRestore) {
				if (env.remoteHost === REMOTION_MODEL_HOST) {
					env.remoteHost = configurationToRestore.remoteHost;
				}

				if (env.remotePathTemplate === REMOTION_MODEL_PATH_TEMPLATE) {
					env.remotePathTemplate = configurationToRestore.remotePathTemplate;
				}
			}
		}
	}
};

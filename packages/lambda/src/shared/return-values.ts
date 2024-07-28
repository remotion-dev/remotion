import type {
	CloudProvider,
	compositionsHandler,
	infoHandler,
} from '@remotion/serverless';
import type {ServerlessRoutines} from '@remotion/serverless/client';
import type {launchHandler} from '../functions/launch';
import type {progressHandler} from '../functions/progress';
import type {rendererHandler} from '../functions/renderer';
import type {startHandler} from '../functions/start';
import type {stillHandler} from '../functions/still';

export interface LambdaReturnValues<Provider extends CloudProvider> {
	[ServerlessRoutines.start]: ReturnType<typeof startHandler>;
	[ServerlessRoutines.launch]: ReturnType<typeof launchHandler>;
	[ServerlessRoutines.renderer]: ReturnType<typeof rendererHandler>;
	[ServerlessRoutines.status]: ReturnType<typeof progressHandler<Provider>>;
	[ServerlessRoutines.info]: ReturnType<typeof infoHandler<Provider>>;
	[ServerlessRoutines.still]: ReturnType<typeof stillHandler>;
	[ServerlessRoutines.compositions]: ReturnType<typeof compositionsHandler>;
}

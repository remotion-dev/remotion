import type {compositionsHandler, infoHandler} from '@remotion/serverless';
import type {ServerlessRoutines} from '@remotion/serverless/client';
import type {launchHandler} from '../functions/launch';
import type {progressHandler} from '../functions/progress';
import type {rendererHandler} from '../functions/renderer';
import type {startHandler} from '../functions/start';
import type {stillHandler} from '../functions/still';

export interface LambdaReturnValues<Region extends string> {
	[ServerlessRoutines.start]: ReturnType<typeof startHandler>;
	[ServerlessRoutines.launch]: ReturnType<typeof launchHandler>;
	[ServerlessRoutines.renderer]: ReturnType<typeof rendererHandler>;
	[ServerlessRoutines.status]: ReturnType<typeof progressHandler<Region>>;
	[ServerlessRoutines.info]: ReturnType<typeof infoHandler<Region>>;
	[ServerlessRoutines.still]: ReturnType<typeof stillHandler>;
	[ServerlessRoutines.compositions]: ReturnType<typeof compositionsHandler>;
}

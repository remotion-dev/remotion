import type {compositionsHandler} from '../functions/compositions';
import type {infoHandler} from '../functions/info';
import type {launchHandler} from '../functions/launch';
import type {progressHandler} from '../functions/progress';
import type {rendererHandler} from '../functions/renderer';
import type {startHandler} from '../functions/start';
import type {stillHandler} from '../functions/still';
import type {LambdaRoutines} from './constants';

export interface LambdaReturnValues {
	[LambdaRoutines.start]: ReturnType<typeof startHandler>;
	[LambdaRoutines.launch]: ReturnType<typeof launchHandler>;
	[LambdaRoutines.renderer]: ReturnType<typeof rendererHandler>;
	[LambdaRoutines.status]: ReturnType<typeof progressHandler>;
	[LambdaRoutines.info]: ReturnType<typeof infoHandler>;
	[LambdaRoutines.still]: ReturnType<typeof stillHandler>;
	[LambdaRoutines.compositions]: ReturnType<typeof compositionsHandler>;
}

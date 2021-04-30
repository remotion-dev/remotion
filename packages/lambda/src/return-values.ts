import {LambdaRoutines} from './constants';
import {fireHandler} from './fire';
import {progressHandler} from './get-progress';
import {launchHandler} from './launch';
import {rendererHandler} from './renderer';
import {startHandler} from './start';

export interface LambdaReturnValues {
	[LambdaRoutines.start]: ReturnType<typeof startHandler>;
	[LambdaRoutines.launch]: ReturnType<typeof launchHandler>;
	[LambdaRoutines.renderer]: ReturnType<typeof rendererHandler>;
	[LambdaRoutines.status]: ReturnType<typeof progressHandler>;
	[LambdaRoutines.fire]: ReturnType<typeof fireHandler>;
}

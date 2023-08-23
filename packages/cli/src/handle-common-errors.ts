import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';

import {printError} from './print-error';
export const handleCommonError = async (err: Error, logLevel: LogLevel) => {
	await printError(err, logLevel);
	RenderInternals.getUsefulErrorMessage(err);
};

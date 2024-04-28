import type {webpack} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import type {MiddleWare} from './middleware';
import {middleware} from './middleware';
import {setupHooks} from './setup-hooks';
import {setupOutputFileSystem} from './setup-output-filesystem';
import type {DevMiddlewareContext} from './types';

export const wdm = (
	compiler: webpack.Compiler,
	logLevel: LogLevel,
): MiddleWare => {
	const context: DevMiddlewareContext = {
		state: false,
		stats: undefined,
		callbacks: [],
		compiler,
		logger: compiler.getInfrastructureLogger('remotion'),
		outputFileSystem: undefined,
	};

	setupHooks(context, logLevel);

	setupOutputFileSystem(context);

	const errorHandler = (error: Error | null | undefined) => {
		if (error) {
			context.logger.error(error);
		}
	};

	const watchOptions = context.compiler.options.watchOptions || {};

	context.compiler.watch(watchOptions, errorHandler);

	return middleware(context);
};

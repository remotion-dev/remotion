import webpack, {Watching} from 'webpack';
import {DevMiddlewareContext} from './types';

import {setupOutputFileSystem} from './setup-output-filesystem';
import {ready} from './ready';
import {setupHooks} from './setup-hooks';
import {getFilenameFromUrl} from './get-filename-from-url';
import {middleware} from './middleware';

const noop = () => undefined;

export const wdm = (compiler: webpack.Compiler) => {
	const context: DevMiddlewareContext = {
		state: false,
		stats: undefined,
		callbacks: [],
		compiler,
		watching: undefined as Watching | undefined,
		logger: compiler.getInfrastructureLogger('webpack-dev-middleware'),
		outputFileSystem: undefined,
	};

	setupHooks(context);

	setupOutputFileSystem(context);

	// Start watching
	if (context.compiler.watching) {
		context.watching = context.compiler.watching;
	} else {
		const errorHandler = (error: Error | undefined) => {
			if (error) {
				context.logger.error(error);
			}
		};

		const watchOptions = context.compiler.options.watchOptions || {};

		context.watching = context.compiler.watch(watchOptions, errorHandler);
	}

	const instance = middleware(context);

	// @ts-expect-error
	instance.getFilenameFromUrl = (url: string): string | undefined =>
		getFilenameFromUrl(context, url);

	// @ts-expect-error
	instance.waitUntilValid = (callback = noop) => {
		ready(context, callback);
	};

	// @ts-expect-error
	instance.invalidate = (callback = noop) => {
		ready(context, callback);

		context.watching?.invalidate();
	};

	// @ts-expect-error
	instance.close = (callback = noop) => {
		context.watching?.close(callback);
	};

	// @ts-expect-error
	instance.context = context;

	return instance;
};

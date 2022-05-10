import webpack from 'webpack';
import {isColorSupported} from './is-color-supported';
import {DevMiddlewareContext} from './types';

export function setupHooks(context: DevMiddlewareContext) {
	function invalid() {
		if (context.state) {
			context.logger.log('Compilation starting...');
		}

		// We are now in invalid state
		context.state = false;
		context.stats = undefined;
	}

	function done(stats: webpack.Stats | undefined) {
		context.state = true;
		context.stats = stats;

		// Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling
		process.nextTick(() => {
			const {logger, state, callbacks} = context;

			// Check if still in valid state
			if (!state || !stats) {
				return;
			}

			logger.log('Compilation finished');

			const statsOptions = {
				preset: 'normal',
				colors: isColorSupported,
			};

			const printedStats = stats.toString(statsOptions);

			// Avoid extra empty line when `stats: 'none'`
			if (printedStats) {
				console.log(printedStats);
			}

			context.callbacks = [];

			callbacks.forEach((callback) => {
				callback(stats);
			});
		});
	}

	context.compiler.hooks.watchRun.tap('webpack-dev-middleware', invalid);
	context.compiler.hooks.invalid.tap('webpack-dev-middleware', invalid);
	context.compiler.hooks.done.tap('webpack-dev-middleware', done);
}

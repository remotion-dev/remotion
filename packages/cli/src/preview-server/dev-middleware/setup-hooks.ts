import type {webpack} from '@remotion/bundler';
import {Log} from '../../log';
import {truthy} from '../../truthy';
import {isColorSupported} from './is-color-supported';
import type {DevMiddlewareContext} from './types';

export function setupHooks(context: DevMiddlewareContext) {
	function invalid() {
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

			const statsOptions: webpack.Configuration['stats'] = {
				preset: 'errors-warnings',
				colors: isColorSupported,
			};

			const printedStats = stats.toString(statsOptions);

			const lines = printedStats
				.split('\n')
				.map((a) => a.trimEnd())
				.filter(truthy)
				.map((a) => {
					if (a.startsWith('webpack compiled')) {
						return `Built in ${stats.endTime - stats.startTime}ms`;
					}

					return a;
				})
				.join('\n');

			if (lines) {
				Log.info(lines);
			}

			context.callbacks = [];

			callbacks.forEach((callback) => {
				callback(stats);
			});
		});
	}

	context.compiler.hooks.watchRun.tap('remotion', invalid);
	context.compiler.hooks.invalid.tap('remotion', invalid);
	context.compiler.hooks.done.tap('remotion', done);
}

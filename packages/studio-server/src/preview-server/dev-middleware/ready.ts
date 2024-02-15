import type {webpack} from '@remotion/bundler';
import type {DevMiddlewareContext} from './types';

export function ready(
	context: DevMiddlewareContext,
	callback: (stats: webpack.Stats | undefined) => undefined | Promise<void>,
) {
	if (context.state) {
		callback(context.stats);

		return;
	}

	context.callbacks.push(callback);
}

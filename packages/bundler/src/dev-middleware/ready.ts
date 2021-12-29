import {IncomingMessage} from 'http';
import webpack from 'webpack';
import {DevMiddlewareContext} from './types';

export function ready(
	context: DevMiddlewareContext,
	callback: (stats: webpack.Stats | undefined) => undefined | Promise<void>,
	req?: IncomingMessage
) {
	if (context.state) {
		callback(context.stats);

		return;
	}

	const name = req?.url || callback.name;

	context.logger.info(`wait until bundle finished${name ? `: ${name}` : ''}`);

	context.callbacks.push(callback);
}

/**
 * Source code is adapted from
 * https://github.com/webpack-contrib/webpack-hot-middleware#readme
 * and rewritten in TypeScript. This file is MIT licensed
 */

import {Request, Response} from 'express';
import {parse} from 'url';
import webpack from 'webpack';
import {
	HotMiddlewareMessage,
	hotMiddlewareOptions,
	HotMiddlewareOptions,
	ModuleMap,
	WebpackStats,
} from './types';

const pathMatch = function (url: string, path: string) {
	try {
		return parse(url).pathname === path;
	} catch (e) {
		return false;
	}
};

export const webpackHotMiddleware = (compiler: webpack.Compiler) => {
	let eventStream: EventStream | null = createEventStream(
		hotMiddlewareOptions.heartbeat
	);
	let latestStats: webpack.Stats | null = null;
	let closed = false;

	compiler.hooks.invalid.tap('webpack-hot-middleware', onInvalid);
	compiler.hooks.done.tap('webpack-hot-middleware', onDone);

	function onInvalid() {
		if (closed) return;
		latestStats = null;
		hotMiddlewareOptions.log('webpack building...');
		eventStream?.publish({
			action: 'building',
		});
	}

	function onDone(statsResult: webpack.Stats) {
		if (closed) return;
		// Keep hold of latest stats so they can be propagated to new clients
		latestStats = statsResult;
		publishStats('built', latestStats, eventStream, hotMiddlewareOptions.log);
	}

	const middleware = function (req: Request, res: Response, next: () => void) {
		if (closed) return next();

		if (!pathMatch(req.url, hotMiddlewareOptions.path)) return next();
		eventStream?.handler(req, res);
		if (latestStats) {
			publishStats('sync', latestStats, eventStream, hotMiddlewareOptions.log);
		}
	};

	middleware.publish = function (payload: HotMiddlewareMessage) {
		if (closed) return;
		eventStream?.publish(payload);
	};

	middleware.close = function () {
		if (closed) return;
		// Can't remove compiler plugins, so we just set a flag and noop if closed
		// https://github.com/webpack/tapable/issues/32#issuecomment-350644466
		closed = true;
		eventStream?.close();
		eventStream = null;
	};

	return middleware;
};

type EventStream = ReturnType<typeof createEventStream>;

function createEventStream(heartbeat: number) {
	let clientId = 0;
	let clients: {[key: string]: Response} = {};

	function everyClient(fn: (client: Response) => void) {
		Object.keys(clients).forEach((id) => {
			fn(clients[id]);
		});
	}

	const interval = setInterval(() => {
		everyClient((client: Response) => {
			client.write('data: \uD83D\uDC93\n\n');
		});
	}, heartbeat).unref();
	return {
		close() {
			clearInterval(interval);
			everyClient((client: Response) => {
				if (!client.finished) client.end();
			});
			clients = {};
		},
		handler(req: Request, res: Response) {
			const headers = {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'text/event-stream;charset=utf-8',
				'Cache-Control': 'no-cache, no-transform',
				// While behind nginx, event stream should not be buffered:
				// http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
				'X-Accel-Buffering': 'no',
			};

			const isHttp1 = !(parseInt(req.httpVersion, 10) >= 2);
			if (isHttp1) {
				req.socket.setKeepAlive(true);
				Object.assign(headers, {
					Connection: 'keep-alive',
				});
			}

			res.writeHead(200, headers);
			res.write('\n');
			const id = clientId++;
			clients[id] = res;
			req.on('close', () => {
				if (!res.finished) res.end();
				delete clients[id];
			});
		},
		publish(payload: HotMiddlewareMessage) {
			everyClient((client) => {
				client.write('data: ' + JSON.stringify(payload) + '\n\n');
			});
		},
	};
}

function publishStats(
	action: HotMiddlewareMessage['action'],
	statsResult: webpack.Stats,
	eventStream: EventStream | null,
	log: HotMiddlewareOptions['log']
) {
	const stats = statsResult.toJson({
		all: false,
		cached: true,
		children: true,
		modules: true,
		timings: true,
		hash: true,
	});
	// For multi-compiler, stats will be an object with a 'children' array of stats
	const bundles = extractBundles(stats);
	bundles.forEach((_stats: WebpackStats) => {
		let name = _stats.name || '';

		// Fallback to compilation name in case of 1 bundle (if it exists)
		if (bundles.length === 1 && !name && statsResult.compilation) {
			name = statsResult.compilation.name || '';
		}

		if (log) {
			log(
				'webpack built ' +
					(name ? name + ' ' : '') +
					_stats.hash +
					' in ' +
					_stats.time +
					'ms'
			);
		}

		eventStream?.publish({
			name,
			action,
			time: _stats.time,
			hash: _stats.hash,
			warnings: _stats.warnings || [],
			errors: _stats.errors || [],
			modules: buildModuleMap(_stats.modules),
		});
	});
}

function extractBundles(stats: WebpackStats) {
	// Stats has modules, single bundle
	if (stats.modules) return [stats];

	// Stats has children, multiple bundles
	if (stats.children?.length) return stats.children;

	// Not sure, assume single
	return [stats];
}

function buildModuleMap(modules: WebpackStats['modules']): ModuleMap {
	const map: {[key: string]: string} = {};
	if (!modules) {
		return map;
	}

	modules.forEach((module) => {
		const id = module.id as string;
		map[id] = module.name as string;
	});
	return map;
}

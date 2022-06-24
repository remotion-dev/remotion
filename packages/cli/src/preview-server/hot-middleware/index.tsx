/**
 * Source code is adapted from
 * https://github.com/webpack-contrib/webpack-hot-middleware#readme
 * and rewritten in TypeScript. This file is MIT licensed
 */

import type {webpack} from '@remotion/bundler';
import type {IncomingMessage, ServerResponse} from 'http';
import {parse} from 'url';
import {Log} from '../../log';
import type {
	HotMiddlewareMessage,
	ModuleMap,
	WebpackStats} from './types';
import {
	hotMiddlewareOptions
} from './types';

const pathMatch = function (url: string, path: string) {
	try {
		return parse(url).pathname === path;
	} catch (e) {
		return false;
	}
};

export const webpackHotMiddleware = (compiler: webpack.Compiler) => {
	const eventStream: EventStream | null = createEventStream(
		hotMiddlewareOptions.heartbeat
	);
	let latestStats: webpack.Stats | null = null;

	compiler.hooks.invalid.tap('remotion', onInvalid);
	compiler.hooks.done.tap('remotion', onDone);

	function onInvalid() {
		latestStats = null;
		Log.info('webpack building...');
		eventStream?.publish({
			action: 'building',
		});
	}

	function onDone(statsResult: webpack.Stats) {
		// Keep hold of latest stats so they can be propagated to new clients
		latestStats = statsResult;

		publishStats('built', latestStats, eventStream);
	}

	const middleware = function (
		req: IncomingMessage,
		res: ServerResponse,
		next: () => void
	) {
		if (!pathMatch(req.url as string, hotMiddlewareOptions.path)) return next();
		eventStream?.handler(req, res);
		if (latestStats) {
			publishStats('sync', latestStats, eventStream);
		}
	};

	return middleware;
};

type EventStream = ReturnType<typeof createEventStream>;

function createEventStream(heartbeat: number) {
	let clientId = 0;
	let clients: {[key: string]: ServerResponse} = {};

	function everyClient(fn: (client: ServerResponse) => void) {
		Object.keys(clients).forEach((id) => {
			fn(clients[id]);
		});
	}

	const interval = setInterval(() => {
		everyClient((client: ServerResponse) => {
			client.write('data: \uD83D\uDC93\n\n');
		});
	}, heartbeat).unref();
	return {
		close() {
			clearInterval(interval);
			everyClient((client: ServerResponse) => {
				if (!client.finished) client.end();
			});
			clients = {};
		},
		handler(req: IncomingMessage, res: ServerResponse) {
			const headers = {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'text/event-stream;charset=utf-8',
				'Cache-Control': 'no-cache, no-transform',
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
	eventStream: EventStream | null
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

		Log.info(`webpack built in ${_stats.time}ms`);

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

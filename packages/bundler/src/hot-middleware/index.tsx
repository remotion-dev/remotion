import webpack from 'webpack';

const {parse} = require('url');

exports.pathMatch = function (url, path) {
	try {
		return parse(url).pathname === path;
	} catch (e) {
		return false;
	}
};

export function webpackHotMiddleware(compiler: webpack.Compiler, opts) {
	opts = opts || {};
	opts.log =
		typeof opts.log === 'undefined' ? console.log.bind(console) : opts.log;
	opts.path = opts.path || '/__webpack_hmr';
	opts.heartbeat = opts.heartbeat || 10 * 1000;

	let eventStream = createEventStream(opts.heartbeat);
	let latestStats = null;
	let closed = false;

	compiler.hooks.invalid.tap('webpack-hot-middleware', onInvalid);
	compiler.hooks.done.tap('webpack-hot-middleware', onDone);

	function onInvalid() {
		if (closed) return;
		latestStats = null;
		if (opts.log) opts.log('webpack building...');
		eventStream.publish({
			action: 'building',
		});
	}

	function onDone(statsResult) {
		if (closed) return;
		// Keep hold of latest stats so they can be propagated to new clients
		latestStats = statsResult;
		publishStats('built', latestStats, eventStream, opts.log);
	}

	const middleware = function (req, res, next) {
		if (closed) return next();
		if (!pathMatch(req.url, opts.path)) return next();
		eventStream.handler(req, res);
		if (latestStats) {
			// Explicitly not passing in `log` fn as we don't want to log again on
			// the server
			publishStats('sync', latestStats, eventStream);
		}
	};

	middleware.publish = function (payload) {
		if (closed) return;
		eventStream.publish(payload);
	};

	middleware.close = function () {
		if (closed) return;
		// Can't remove compiler plugins, so we just set a flag and noop if closed
		// https://github.com/webpack/tapable/issues/32#issuecomment-350644466
		closed = true;
		eventStream.close();
		eventStream = null;
	};

	return middleware;
}

function createEventStream(heartbeat) {
	let clientId = 0;
	let clients = {};

	function everyClient(fn) {
		Object.keys(clients).forEach((id) => {
			fn(clients[id]);
		});
	}

	const interval = setInterval(function heartbeatTick() {
		everyClient((client) => {
			client.write('data: \uD83D\uDC93\n\n');
		});
	}, heartbeat).unref();
	return {
		close() {
			clearInterval(interval);
			everyClient((client) => {
				if (!client.finished) client.end();
			});
			clients = {};
		},
		handler(req, res) {
			const headers = {
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'text/event-stream;charset=utf-8',
				'Cache-Control': 'no-cache, no-transform',
				// While behind nginx, event stream should not be buffered:
				// http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
				'X-Accel-Buffering': 'no',
			};

			const isHttp1 = !(parseInt(req.httpVersion) >= 2);
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
		publish(payload) {
			everyClient((client) => {
				client.write('data: ' + JSON.stringify(payload) + '\n\n');
			});
		},
	};
}

function publishStats(action, statsResult, eventStream, log) {
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
	bundles.forEach((stats) => {
		let name = stats.name || '';

		// Fallback to compilation name in case of 1 bundle (if it exists)
		if (bundles.length === 1 && !name && statsResult.compilation) {
			name = statsResult.compilation.name || '';
		}

		if (log) {
			log(
				'webpack built ' +
					(name ? name + ' ' : '') +
					stats.hash +
					' in ' +
					stats.time +
					'ms'
			);
		}

		eventStream.publish({
			name,
			action,
			time: stats.time,
			hash: stats.hash,
			warnings: stats.warnings || [],
			errors: stats.errors || [],
			modules: buildModuleMap(stats.modules),
		});
	});
}

function extractBundles(stats) {
	// Stats has modules, single bundle
	if (stats.modules) return [stats];

	// Stats has children, multiple bundles
	if (stats.children && stats.children.length) return stats.children;

	// Not sure, assume single
	return [stats];
}

function buildModuleMap(modules) {
	const map = {};
	modules.forEach((module) => {
		map[module.id] = module.name;
	});
	return map;
}

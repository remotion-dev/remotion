import {processUpdate} from './process-update';

const options = {
	path: '/__webpack_hmr',
	timeout: 20 * 1000,
	overlay: true,
	reload: false,
	log: true,
	warn: true,
	name: '',
	autoConnect: true,
	overlayStyles: {},
	overlayWarnings: false,
	ansiColors: {},
};

if (typeof window === 'undefined') {
	// do nothing
} else if (typeof window.EventSource === 'undefined') {
	console.warn(
		'Unsupported browser: You need a browser that supports EventSource '
	);
} else if (options.autoConnect) {
	connect();
}

function setOptionsAndConnect() {
	connect();
}

function EventSourceWrapper() {
	let source: EventSource;
	let lastActivity = Date.now();
	const listeners = [];

	init();
	const timer = setInterval(() => {
		if (Date.now() - lastActivity > options.timeout) {
			handleDisconnect();
		}
	}, options.timeout / 2);

	function init() {
		source = new window.EventSource(options.path);
		source.onopen = handleOnline;
		source.onerror = handleDisconnect;
		source.onmessage = handleMessage;
	}

	function handleOnline() {
		if (options.log) console.log('[HMR] connected');
		lastActivity = Date.now();
	}

	function handleMessage(event) {
		lastActivity = Date.now();
		for (let i = 0; i < listeners.length; i++) {
			listeners[i](event);
		}
	}

	function handleDisconnect() {
		clearInterval(timer);
		source.close();
		setTimeout(init, options.timeout);
	}

	return {
		addMessageListener(fn) {
			listeners.push(fn);
		},
	};
}

function getEventSourceWrapper() {
	if (!window.__whmEventSourceWrapper) {
		window.__whmEventSourceWrapper = {};
	}

	if (!window.__whmEventSourceWrapper[options.path]) {
		// cache the wrapper for other entries loaded on
		// the same page with the same options.path
		window.__whmEventSourceWrapper[options.path] = EventSourceWrapper();
	}

	return window.__whmEventSourceWrapper[options.path];
}

function connect() {
	getEventSourceWrapper().addMessageListener(handleMessage);

	function handleMessage(event) {
		if (event.data === '\uD83D\uDC93') {
			return;
		}

		try {
			processMessage(JSON.parse(event.data));
		} catch (ex) {
			if (options.warn) {
				console.warn('Invalid HMR message: ' + event.data + '\n' + ex);
			}
		}
	}
}

// the reporter needs to be a singleton on the page
// in case the client is being used by multiple bundles
// we only want to report once.
// all the errors will go to all clients
const singletonKey = '__webpack_hot_middleware_reporter__';
let reporter;
if (typeof window !== 'undefined') {
	if (!window[singletonKey]) {
		window[singletonKey] = createReporter();
	}

	reporter = window[singletonKey];
}

function createReporter() {
	const strip = require('strip-ansi');

	let overlay;
	if (typeof document !== 'undefined' && options.overlay) {
		overlay = require('./client-overlay')({
			ansiColors: options.ansiColors,
			overlayStyles: options.overlayStyles,
		});
	}

	const styles = {
		errors: 'color: #ff0000;',
		warnings: 'color: #999933;',
	};
	let previousProblems = null;

	function log(type, obj) {
		const newProblems = obj[type]
			.map((msg) => {
				return strip(msg);
			})
			.join('\n');
		if (previousProblems == newProblems) {
			return;
		}

		previousProblems = newProblems;

		const style = styles[type];
		const name = obj.name ? "'" + obj.name + "' " : '';
		const title =
			'[HMR] bundle ' + name + 'has ' + obj[type].length + ' ' + type;
		// NOTE: console.warn or console.error will print the stack trace
		// which isn't helpful here, so using console.log to escape it.
		if (console.group && console.groupEnd) {
			console.group('%c' + title, style);
			console.log('%c' + newProblems, style);
			console.groupEnd();
		} else {
			console.log(
				'%c' + title + '\n\t%c' + newProblems.replace(/\n/g, '\n\t'),
				style + 'font-weight: bold;',
				style + 'font-weight: normal;'
			);
		}
	}

	return {
		cleanProblemsCache() {
			previousProblems = null;
		},
		problems(type, obj) {
			if (options.warn) {
				log(type, obj);
			}

			if (overlay) {
				if (options.overlayWarnings || type === 'errors') {
					overlay.showProblems(type, obj[type]);
					return false;
				}

				overlay.clear();
			}

			return true;
		},
		success() {
			if (overlay) overlay.clear();
		},
		useCustomOverlay(customOverlay) {
			overlay = customOverlay;
		},
	};
}

let customHandler;
let subscribeAllHandler;

function processMessage(obj) {
	switch (obj.action) {
		case 'building':
			if (options.log) {
				console.log(
					'[HMR] bundle ' +
						(obj.name ? "'" + obj.name + "' " : '') +
						'rebuilding'
				);
			}

			break;
		case 'built':
			if (options.log) {
				console.log(
					'[HMR] bundle ' +
						(obj.name ? "'" + obj.name + "' " : '') +
						'rebuilt in ' +
						obj.time +
						'ms'
				);
			}

		// fall through
		case 'sync':
			if (obj.name && options.name && obj.name !== options.name) {
				return;
			}

			var applyUpdate = true;
			if (obj.errors.length > 0) {
				if (reporter) reporter.problems('errors', obj);
				applyUpdate = false;
			} else if (obj.warnings.length > 0) {
				if (reporter) {
					const overlayShown = reporter.problems('warnings', obj);
					applyUpdate = overlayShown;
				}
			} else if (reporter) {
				reporter.cleanProblemsCache();
				reporter.success();
			}

			if (applyUpdate) {
				processUpdate(obj.hash, obj.modules, options);
			}

			break;
		default:
			if (customHandler) {
				customHandler(obj);
			}
	}

	if (subscribeAllHandler) {
		subscribeAllHandler(obj);
	}
}

module.exports = {
	subscribeAll(handler) {
		subscribeAllHandler = handler;
	},
	subscribe(handler) {
		customHandler = handler;
	},
	setOptionsAndConnect,
};

/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

/* eslint-disable no-console */
/**
 * Source code is adapted from
 * https://github.com/webpack-contrib/webpack-hot-middleware#readme
 * and rewritten in TypeScript. This file is MIT licensed
 */
import type {HotMiddlewareMessage} from '@remotion/studio-shared';
import {hotMiddlewareOptions, stripAnsi} from '@remotion/studio-shared';
import {processUpdate} from './process-update';

function eventSourceWrapper() {
	let source: EventSource;
	let lastActivity = Date.now();
	const listeners: ((ev: MessageEvent) => void)[] = [];

	init();
	const timer = setInterval(() => {
		if (Date.now() - lastActivity > hotMiddlewareOptions.timeout) {
			handleDisconnect();
		}
	}, hotMiddlewareOptions.timeout / 2);

	function init() {
		source = new window.EventSource(hotMiddlewareOptions.path);
		source.onopen = handleOnline;
		source.onerror = handleDisconnect;
		source.onmessage = handleMessage;
	}

	function handleOnline() {
		lastActivity = Date.now();
	}

	function handleMessage(event: MessageEvent) {
		lastActivity = Date.now();
		for (let i = 0; i < listeners.length; i++) {
			listeners[i](event);
		}
	}

	function handleDisconnect() {
		clearInterval(timer);
		source.close();
		setTimeout(init, 1000);
	}

	return {
		addMessageListener(fn: (msg: MessageEvent) => void) {
			listeners.push(fn);
		},
	};
}

declare global {
	interface Window {
		__whmEventSourceWrapper: {
			[key: string]: ReturnType<typeof eventSourceWrapper>;
		};
		__webpack_hot_middleware_reporter__: Reporter;
	}
}

function getEventSourceWrapper() {
	if (!window.__whmEventSourceWrapper) {
		window.__whmEventSourceWrapper = {};
	}

	if (!window.__whmEventSourceWrapper[hotMiddlewareOptions.path]) {
		// cache the wrapper for other entries loaded on
		// the same page with the same hotMiddlewareOptions.path
		window.__whmEventSourceWrapper[hotMiddlewareOptions.path] =
			eventSourceWrapper();
	}

	return window.__whmEventSourceWrapper[hotMiddlewareOptions.path];
}

function connect() {
	getEventSourceWrapper().addMessageListener(handleMessage);

	function handleMessage(event: MessageEvent) {
		if (event.data === '\uD83D\uDC93') {
			return;
		}

		try {
			processMessage(JSON.parse(event.data));
		} catch (ex) {
			if (hotMiddlewareOptions.warn) {
				console.warn('Invalid HMR message: ' + event.data + '\n' + ex);
			}
		}
	}
}

type Reporter = ReturnType<typeof createReporter>;

function createReporter() {
	const styles = {
		errors: 'color: #ff0000;',
		warnings: 'color: #999933;',
	};
	let previousProblems: string | null = null;

	function log(type: 'errors' | 'warnings', obj: HotMiddlewareMessage) {
		if (obj.action === 'building') {
			console.log('[Fast Refresh] Building');
			return;
		}

		const newProblems = obj[type]
			.map((msg) => {
				return stripAnsi(msg as string);
			})
			.join('\n');
		if (previousProblems === newProblems) {
			return;
		}

		previousProblems = newProblems;

		const style = styles[type];
		const name = obj.name ? "'" + obj.name + "' " : '';
		const title =
			'[Fast Refresh] bundle ' + name + 'has ' + obj[type].length + ' ' + type;
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
				style + 'font-weight: normal;',
			);
		}
	}

	return {
		cleanProblemsCache() {
			previousProblems = null;
		},
		problems(type: 'errors' | 'warnings', obj: HotMiddlewareMessage) {
			if (hotMiddlewareOptions.warn) {
				log(type, obj);
			}

			return true;
		},
		success: () => undefined,
	};
}

function processMessage(obj: HotMiddlewareMessage) {
	switch (obj.action) {
		case 'building':
			window.remotion_isBuilding?.();

			break;
		case 'sync':
		case 'built': {
			let applyUpdate = true;
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
				window.remotion_finishedBuilding?.();
				processUpdate(obj.hash, obj.modules, hotMiddlewareOptions);
			}

			break;
		}

		default:
			break;
	}
}

let reporter: Reporter;
const singletonKey = '__webpack_hot_middleware_reporter__' as const;

export const enableHotMiddleware = () => {
	if (typeof window === 'undefined') {
		// do nothing
	} else if (typeof window.EventSource === 'undefined') {
		console.warn(
			'Unsupported browser: You need a browser that supports EventSource ',
		);
	} else {
		connect();
	}

	if (typeof window !== 'undefined') {
		if (!window[singletonKey]) {
			window[singletonKey] = createReporter();
		}

		reporter = window[singletonKey];
	}
};

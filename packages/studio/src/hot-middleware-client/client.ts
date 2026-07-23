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
import {markErrorMessageAsLoggedByServer} from '../error-overlay/error-origin';
import {
	HOT_MIDDLEWARE_ERROR_STYLE,
	HOT_MIDDLEWARE_WARNING_STYLE,
} from '../helpers/colors';
import {subscribeToPreviewServerEvents} from '../helpers/preview-server-events';
import {processUpdate} from './process-update';

declare global {
	interface Window {
		__webpack_hot_middleware_reporter__: Reporter;
		__remotion_processHmrEvent?: (hmrEvent: HotMiddlewareMessage) => void;
	}
}

type Reporter = ReturnType<typeof createReporter>;

function createReporter() {
	const styles = {
		errors: HOT_MIDDLEWARE_ERROR_STYLE,
		warnings: HOT_MIDDLEWARE_WARNING_STYLE,
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
				obj.errors.forEach((error) => {
					if (typeof error === 'string') {
						markErrorMessageAsLoggedByServer(stripAnsi(error));
					}
				});

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
let unsubscribeFromPreviewServerEvents: (() => void) | null = null;

export const enableHotMiddleware = () => {
	if (typeof window !== 'undefined') {
		if (!window[singletonKey]) {
			window[singletonKey] = createReporter();
		}

		reporter = window[singletonKey];
	}

	window.__remotion_processHmrEvent = (hmrEvent: HotMiddlewareMessage) => {
		processMessage(hmrEvent);
	};

	// Connect to /events immediately so HMR works before React mounts.
	// PreviewServerConnection reuses the same EventSource via preview-server-events.
	if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
		if (!unsubscribeFromPreviewServerEvents) {
			unsubscribeFromPreviewServerEvents = subscribeToPreviewServerEvents(
				(event) => {
					if (event.type === 'hmr') {
						processMessage(event.hmrEvent);
					}
				},
			);
		}
	}
};

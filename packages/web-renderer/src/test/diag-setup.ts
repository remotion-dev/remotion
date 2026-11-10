import {afterEach, beforeEach, expect} from 'vitest';
import {diagLog} from './diag';

// Log the GPU the browser renders with, once per browser.
const gl = document.createElement('canvas').getContext('webgl');
const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
diagLog(
	`gpu: ${
		gl && debugInfo
			? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
			: 'no webgl'
	} | ua: ${navigator.userAgent}`,
);

// Detect main-thread stalls: a 10ms interval that fires late means the page's
// main thread (or the whole browser process) did not run.
let interval: ReturnType<typeof setInterval> | null = null;
let last = 0;
let maxGap = 0;
let gapsOver200 = 0;
let start = 0;
let longTasks = 0;
let longTaskMs = 0;

const observer =
	typeof PerformanceObserver !== 'undefined' &&
	PerformanceObserver.supportedEntryTypes.includes('longtask')
		? new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					longTasks++;
					longTaskMs += entry.duration;
				}
			})
		: null;
observer?.observe({type: 'longtask', buffered: false});

beforeEach(() => {
	start = performance.now();
	last = start;
	maxGap = 0;
	gapsOver200 = 0;
	longTasks = 0;
	longTaskMs = 0;
	interval = setInterval(() => {
		const now = performance.now();
		const gap = now - last;
		maxGap = Math.max(maxGap, gap);
		if (gap > 200) {
			gapsOver200++;
		}

		last = now;
	}, 10);
});

afterEach(() => {
	if (interval) {
		clearInterval(interval);
	}

	diagLog(
		`test "${expect.getState().currentTestName}": ${Math.round(
			performance.now() - start,
		)}ms, max timer gap ${Math.round(maxGap)}ms, gaps>200ms ${gapsOver200}, long tasks ${longTasks} (${Math.round(longTaskMs)}ms)`,
	);
});

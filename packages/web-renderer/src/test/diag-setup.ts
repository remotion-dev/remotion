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

// Probes that depend on the compositor / GPU process rather than the page's
// main thread: rAF needs frames to be produced, and toBlob() encodes off the
// main thread. If these stall while the 10ms timer keeps firing, the stall is
// outside the page.
let maxRafGap = 0;
let rafGapsOver500 = 0;
let lastRaf = performance.now();
const rafLoop = () => {
	const now = performance.now();
	const gap = now - lastRaf;
	maxRafGap = Math.max(maxRafGap, gap);
	if (gap > 500) {
		rafGapsOver500++;
		diagLog(`rAF stall ${Math.round(gap)}ms ending at +${Math.round(now)}ms`);
	}

	lastRaf = now;
	requestAnimationFrame(rafLoop);
};

requestAnimationFrame(rafLoop);

let maxToBlob = 0;
const probeCanvas = document.createElement('canvas');
probeCanvas.width = 16;
probeCanvas.height = 16;
probeCanvas.getContext('2d')!.fillRect(0, 0, 8, 8);
const toBlobLoop = () => {
	const probeStart = performance.now();
	probeCanvas.toBlob(() => {
		const took = performance.now() - probeStart;
		maxToBlob = Math.max(maxToBlob, took);
		if (took > 500) {
			diagLog(
				`toBlob probe stall ${Math.round(took)}ms ending at +${Math.round(performance.now())}ms`,
			);
		}

		setTimeout(toBlobLoop, 250);
	}, 'image/png');
};

toBlobLoop();

beforeEach(() => {
	start = performance.now();
	last = start;
	maxGap = 0;
	gapsOver200 = 0;
	longTasks = 0;
	longTaskMs = 0;
	maxRafGap = 0;
	rafGapsOver500 = 0;
	maxToBlob = 0;
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
		)}ms, max timer gap ${Math.round(maxGap)}ms, gaps>200ms ${gapsOver200}, long tasks ${longTasks} (${Math.round(longTaskMs)}ms), max rAF gap ${Math.round(maxRafGap)}ms, rAF gaps>500ms ${rafGapsOver500}, max toBlob probe ${Math.round(maxToBlob)}ms, ended at +${Math.round(performance.now())}ms`,
	);
});

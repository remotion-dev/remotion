import type {LiteEvent} from 'react-scan/lite';
import {instrument} from 'react-scan/lite';

const endpoint = process.env.REMOTION_REACT_SCAN_ENDPOINT;
const sessionId = process.env.REMOTION_REACT_SCAN_SESSION_ID;

if (!endpoint || !sessionId) {
	throw new Error('React Scan capture environment variables are missing');
}

const pendingEvents: LiteEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let batchSequence = 0;
let warnedAboutConnectionFailure = false;

const flush = () => {
	if (flushTimer !== null) {
		clearTimeout(flushTimer);
		flushTimer = null;
	}

	if (pendingEvents.length === 0) {
		return;
	}

	const events = pendingEvents.splice(0, pendingEvents.length);
	const sequence = batchSequence;
	batchSequence++;

	fetch(endpoint, {
		body: JSON.stringify({
			client:
				sequence === 0
					? {
							devicePixelRatio: window.devicePixelRatio,
							height: window.innerHeight,
							href: window.location.href,
							userAgent: navigator.userAgent,
							width: window.innerWidth,
						}
					: undefined,
			events,
			sequence,
			sessionId,
		}),
		headers: {'Content-Type': 'application/json'},
		method: 'POST',
	}).catch(() => {
		if (!warnedAboutConnectionFailure) {
			warnedAboutConnectionFailure = true;
			// eslint-disable-next-line no-console
			console.warn('Could not stream React Scan events to the collector.');
		}
	});
};

instrument({
	includeFiberIdentity: true,
	includeFiberSource: true,
	maxFibersPerCommit: 5000,
	minFiberActualDurationMs: 0,
	onEvent: (event) => {
		pendingEvents.push(event);

		if (pendingEvents.length >= 20) {
			flush();
			return;
		}

		if (flushTimer === null) {
			flushTimer = setTimeout(flush, 100);
		}
	},
	recordChangeDescriptions: true,
});

window.addEventListener('pagehide', flush);

import type {LiteEvent} from 'react-scan/lite';
import {instrument} from 'react-scan/lite';
import {summarizeReactScanEvents} from './summarize';

const endpoint = process.env.REMOTION_REACT_SCAN_ENDPOINT;
const sessionId = process.env.REMOTION_REACT_SCAN_SESSION_ID;

if (!endpoint || !sessionId) {
	throw new Error('React Scan capture environment variables are missing');
}

const pendingEvents: LiteEvent[] = [];
const recordingContextEvents = new Map<string, LiteEvent>();
let recordedEvents: LiteEvent[] = [];
let recordingStartedAt: string | null = null;
let recordingStartedAtInMilliseconds: number | null = null;
let recordingEndedAt: string | null = null;
let recordingDurationInMilliseconds: number | null = null;
let isRecording = false;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let batchSequence = 0;
let warnedAboutConnectionFailure = false;
let flushChain = Promise.resolve();

const flush = () => {
	if (flushTimer !== null) {
		clearTimeout(flushTimer);
		flushTimer = null;
	}

	if (pendingEvents.length === 0) {
		return flushChain;
	}

	const events = pendingEvents.splice(0, pendingEvents.length);
	const sequence = batchSequence;
	batchSequence++;

	flushChain = flushChain.then(async () => {
		try {
			await fetch(endpoint, {
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
			});
		} catch {
			if (!warnedAboutConnectionFailure) {
				warnedAboutConnectionFailure = true;
				console.warn('Could not stream React Scan events to the collector.');
			}
		}
	});

	return flushChain;
};

const getRecordingStatus = () => ({
	durationInMilliseconds: recordingDurationInMilliseconds,
	endedAt: recordingEndedAt,
	eventCount: recordedEvents.length,
	recording: isRecording,
	startedAt: recordingStartedAt,
});

type WebMcpTool = {
	readonly name: string;
	readonly title: string;
	readonly description: string;
	readonly inputSchema: Record<string, unknown>;
	readonly annotations: {readonly readOnlyHint: boolean};
	readonly execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type WebMcpModelContext = {
	registerTool: (
		tool: WebMcpTool,
		options: {readonly signal: AbortSignal},
	) => Promise<void>;
};

const {modelContext} = document as Document & {
	readonly modelContext?: WebMcpModelContext;
};

if (typeof modelContext?.registerTool === 'function') {
	const controller = new AbortController();
	const emptyInputSchema = {
		type: 'object',
		properties: {},
		additionalProperties: false,
	};

	Promise.all([
		modelContext.registerTool(
			{
				name: 'start_react_scan_recording',
				title: 'Start React Scan recording',
				description:
					'Start a focused React Scan Lite recording in this development Studio. This clears the previous in-memory recording. Keep recordings short and perform only the interaction being measured.',
				inputSchema: emptyInputSchema,
				annotations: {readOnlyHint: false},
				execute: async () => {
					if (isRecording) {
						throw new Error('React Scan is already recording.');
					}

					if (flushTimer !== null) {
						clearTimeout(flushTimer);
						flushTimer = null;
					}

					pendingEvents.splice(0, pendingEvents.length);
					recordedEvents = [...recordingContextEvents.values()];
					pendingEvents.push(...recordedEvents);
					recordingStartedAt = new Date().toISOString();
					recordingStartedAtInMilliseconds = performance.now();
					recordingEndedAt = null;
					recordingDurationInMilliseconds = null;
					isRecording = true;

					return getRecordingStatus();
				},
			},
			{signal: controller.signal},
		),
		modelContext.registerTool(
			{
				name: 'stop_react_scan_recording',
				title: 'Stop React Scan recording',
				description:
					'Stop the active React Scan Lite recording and freeze it for retrieval. Call get_react_scan_recording afterwards to return its events and summary.',
				inputSchema: emptyInputSchema,
				annotations: {readOnlyHint: false},
				execute: async () => {
					if (!isRecording || recordingStartedAtInMilliseconds === null) {
						throw new Error('React Scan is not recording.');
					}

					recordingDurationInMilliseconds = Number(
						(performance.now() - recordingStartedAtInMilliseconds).toFixed(3),
					);
					recordingEndedAt = new Date().toISOString();
					isRecording = false;
					await flush();

					return getRecordingStatus();
				},
			},
			{signal: controller.signal},
		),
		modelContext.registerTool(
			{
				name: 'get_react_scan_recording',
				title: 'Get React Scan recording',
				description:
					'Return the current React Scan Lite recording, including raw events and a summary ranked by commit and component cost. Stop the recording first so the result is stable.',
				inputSchema: emptyInputSchema,
				annotations: {readOnlyHint: true},
				execute: async () => {
					if (recordingStartedAt === null) {
						throw new Error('No React Scan recording has been started.');
					}
					if (isRecording) {
						throw new Error('Stop React Scan before returning the recording.');
					}

					const receivedAt = new Date().toISOString();
					return {
						...getRecordingStatus(),
						events: recordedEvents,
						summary: summarizeReactScanEvents(
							recordedEvents.map((event, eventIndex) => ({
								event,
								eventIndex,
								receivedAt,
								sequence: 0,
								sessionId,
							})),
						),
					};
				},
			},
			{signal: controller.signal},
		),
	]).catch(() => undefined);
}

instrument({
	includeFiberIdentity: true,
	includeFiberSource: true,
	maxFibersPerCommit: 5000,
	minFiberActualDurationMs: 0,
	onEvent: (event) => {
		if (
			event.kind === 'renderer-injected' ||
			event.kind === 'profiling-hooks-status'
		) {
			recordingContextEvents.set(
				`${event.kind}:${event.rendererId ?? 'unknown'}`,
				event,
			);
		}

		if (!isRecording) {
			return;
		}

		recordedEvents.push(event);
		pendingEvents.push(event);

		if (pendingEvents.length >= 20) {
			void flush();
			return;
		}

		if (flushTimer === null) {
			flushTimer = setTimeout(() => void flush(), 100);
		}
	},
	recordChangeDescriptions: true,
});

window.addEventListener('pagehide', () => void flush());

import type {LiteEvent} from 'react-scan/lite';
import {instrument} from 'react-scan/lite';
import {summarizeReactScanEvents} from './summarize';

const recordingContextEvents = new Map<string, LiteEvent>();
let recordedEvents: LiteEvent[] = [];
let recordingStartedAt: string | null = null;
let recordingStartedAtInMilliseconds: number | null = null;
let recordingEndedAt: string | null = null;
let recordingDurationInMilliseconds: number | null = null;
let isRecording = false;

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

					recordedEvents = [...recordingContextEvents.values()];
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

					return {
						...getRecordingStatus(),
						events: recordedEvents,
						summary: summarizeReactScanEvents(recordedEvents),
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
	},
	recordChangeDescriptions: true,
});

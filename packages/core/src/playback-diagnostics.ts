export const playbackDiagnostics = {
	audioIteratorsCreated: 0,
	mediabunnySinksOpen: 0,
	bufferingHandlesCreated: 0,
	bufferingStatesTriggered: 0,
};

export type BufferingTraceOwner = {
	sequenceId: string;
	name: string;
	source: string | null;
	stack: string | null;
	overrideId: string | null;
};

export type BufferingTraceSource = {
	compositionId: string | null;
	frame: number;
	stack: string | null;
	owners: BufferingTraceOwner[];
};

type TracedBufferingHandle = BufferingTraceSource & {
	id: number;
	createdAt: number;
	releasedAt: number | null;
	releasedFrame: number | null;
};

type BufferingEvent = {
	id: number;
	compositionId: string | null;
	frame: number;
	startedAt: number;
	endedAt: number | null;
	endReason: 'resumed' | 'unmounted' | null;
	handles: TracedBufferingHandle[];
	omittedHandles: number;
};

const MAX_BUFFERING_EVENTS = 100;
const MAX_HANDLES_PER_EVENT = 50;
const bufferingEvents: BufferingEvent[] = [];
const traceSources = {panel: false, webmcp: false};
let nextHandleId = 1;
let nextEventId = 1;
let traceRevision = 0;
let droppedEvents = 0;

export const bufferingDiagnostics = {
	isEnabled: () => traceSources.panel || traceSources.webmcp,
	setEnabled: (source: keyof typeof traceSources, enabled: boolean) => {
		if (traceSources[source] !== enabled) {
			traceSources[source] = enabled;
			traceRevision++;
		}
	},
	createHandle: (getSource: (() => BufferingTraceSource) | null) => {
		if (!bufferingDiagnostics.isEnabled()) {
			return null;
		}

		const source = getSource?.() ?? {
			compositionId: null,
			frame: 0,
			stack: null,
			owners: [],
		};
		return {
			...source,
			id: nextHandleId++,
			createdAt: performance.now(),
			releasedAt: null,
			releasedFrame: null,
		} as TracedBufferingHandle;
	},
	releaseHandle: (handle: TracedBufferingHandle, frame: number) => {
		if (handle.releasedAt !== null) {
			return;
		}

		handle.releasedAt = performance.now();
		handle.releasedFrame = frame;
		traceRevision++;
	},
	startEvent: ({
		compositionId,
		frame,
		handles,
		untracedHandles,
	}: {
		compositionId: string | null;
		frame: number;
		handles: TracedBufferingHandle[];
		untracedHandles: number;
	}) => {
		if (!bufferingDiagnostics.isEnabled()) {
			return null;
		}

		const event: BufferingEvent = {
			id: nextEventId++,
			compositionId,
			frame,
			startedAt: performance.now(),
			endedAt: null,
			endReason: null,
			handles: handles.slice(0, MAX_HANDLES_PER_EVENT),
			omittedHandles:
				untracedHandles + Math.max(0, handles.length - MAX_HANDLES_PER_EVENT),
		};
		bufferingEvents.push(event);
		if (bufferingEvents.length > MAX_BUFFERING_EVENTS) {
			bufferingEvents.shift();
			droppedEvents++;
		}

		traceRevision++;
		return event;
	},
	addHandle: (event: BufferingEvent, handle: TracedBufferingHandle | null) => {
		if (handle && event.handles.length < MAX_HANDLES_PER_EVENT) {
			event.handles.push(handle);
		} else {
			event.omittedHandles++;
		}

		traceRevision++;
	},
	endEvent: (event: BufferingEvent, reason: 'resumed' | 'unmounted') => {
		if (event.endedAt !== null) {
			return;
		}

		event.endedAt = performance.now();
		event.endReason = reason;
		traceRevision++;
	},
	clear: () => {
		for (let i = bufferingEvents.length - 1; i >= 0; i--) {
			if (bufferingEvents[i].endedAt !== null) {
				bufferingEvents.splice(i, 1);
			}
		}

		droppedEvents = 0;
		traceRevision++;
	},
	getSnapshot: () => ({
		enabled: bufferingDiagnostics.isEnabled(),
		panelEnabled: traceSources.panel,
		webmcpEnabled: traceSources.webmcp,
		revision: traceRevision,
		maxEvents: MAX_BUFFERING_EVENTS,
		maxHandlesPerEvent: MAX_HANDLES_PER_EVENT,
		droppedEvents,
		events: bufferingEvents.map((event) => ({
			...event,
			handles: event.handles.map((handle) => ({
				...handle,
				owners: handle.owners.map((owner) => ({...owner})),
			})),
		})),
	}),
};

export const registerMediabunnySink = (input: {disposed: boolean}) => {
	let released = input.disposed;
	if (!released) {
		playbackDiagnostics.mediabunnySinksOpen++;
	}

	return () => {
		if (released) {
			return;
		}

		released = true;
		playbackDiagnostics.mediabunnySinksOpen--;
	};
};

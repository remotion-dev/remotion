import {afterEach, beforeEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import React, {useContext, useLayoutEffect} from 'react';
import {BufferingContextReact, BufferingProvider} from '../buffering.js';
import {
	bufferingDiagnostics,
	playbackDiagnostics,
} from '../playback-diagnostics.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {
	SetTimelineContext,
	TimelineContextProvider,
} from '../TimelineContext.js';

const previewEnvironment: RemotionEnvironment = {
	isStudio: false,
	isRendering: false,
	isPlayer: true,
	isReadOnlyStudio: false,
	isClientSideRendering: false,
};

let manager: React.ContextType<typeof BufferingContextReact> = null;
let events: string[] = [];
let readIsBuffering = () => false;

const Harness: React.FC = () => {
	manager = useContext(BufferingContextReact);
	const {isBuffering, subscribeBuffering} = useContext(SetTimelineContext);
	readIsBuffering = isBuffering;

	useLayoutEffect(() => {
		return subscribeBuffering((state) => {
			events.push(state.buffering ? 'waiting' : 'resume');
		});
	}, [subscribeBuffering]);

	return null;
};

const Provider: React.FC<{readonly children?: React.ReactNode}> = ({
	children,
}) => (
	<RemotionEnvironmentContext.Provider value={previewEnvironment}>
		<TimelineContextProvider frameState={null}>
			<BufferingProvider>
				<Harness />
				{children}
			</BufferingProvider>
		</TimelineContextProvider>
	</RemotionEnvironmentContext.Provider>
);

beforeEach(() => {
	manager = null;
	events = [];
	readIsBuffering = () => false;
	bufferingDiagnostics.setEnabled('webmcp', false);
	bufferingDiagnostics.setEnabled('panel', false);
	bufferingDiagnostics.clear();
});

afterEach(() => {
	cleanup();
	bufferingDiagnostics.setEnabled('webmcp', false);
	bufferingDiagnostics.setEnabled('panel', false);
	bufferingDiagnostics.clear();
});

test('does not emit "resume" on mount', () => {
	render(<Provider />);
	expect(events).toEqual([]);
	let sourceRead = false;
	expect(
		bufferingDiagnostics.createHandle(() => {
			sourceRead = true;
			return {compositionId: null, frame: 0, stack: null, owners: []};
		}),
	).toBeNull();
	expect(sourceRead).toBe(false);
});

test('emits "waiting" and "resume" only on empty <-> non-empty transitions', () => {
	const statesBefore = playbackDiagnostics.bufferingStatesTriggered;
	bufferingDiagnostics.setEnabled('webmcp', true);
	render(<Provider />);

	let firstBlock: {unblock: () => void} | null = null;
	let secondBlock: {unblock: () => void} | null = null;

	act(() => {
		firstBlock = manager!.addBlock(() => ({
			compositionId: 'test',
			frame: 10,
			stack: 'creation stack',
			owners: [
				{
					sequenceId: 'video',
					name: 'Video',
					source: 'video.mp4',
					stack: 'owner stack',
					overrideId: null,
				},
			],
		}));
	});
	expect(events).toEqual(['waiting']);
	expect(readIsBuffering()).toBe(true);
	expect(playbackDiagnostics.bufferingStatesTriggered).toBe(statesBefore + 1);
	const initialTrace = bufferingDiagnostics.getSnapshot().events;
	expect(initialTrace).toHaveLength(1);
	expect(initialTrace[0].handles).toHaveLength(1);
	expect(initialTrace[0].endedAt).toBeNull();
	expect(initialTrace[0].handles[0]).toMatchObject({
		compositionId: 'test',
		frame: 10,
		stack: 'creation stack',
		owners: [{sequenceId: 'video', source: 'video.mp4'}],
	});
	bufferingDiagnostics.clear();
	expect(bufferingDiagnostics.getSnapshot().events).toHaveLength(1);

	act(() => {
		secondBlock = manager!.addBlock(null);
	});
	expect(events).toEqual(['waiting']);
	expect(playbackDiagnostics.bufferingStatesTriggered).toBe(statesBefore + 1);

	act(() => {
		firstBlock!.unblock();
	});
	expect(events).toEqual(['waiting']);
	expect(readIsBuffering()).toBe(true);

	act(() => {
		secondBlock!.unblock();
	});
	expect(events).toEqual(['waiting', 'resume']);
	const [trace] = bufferingDiagnostics.getSnapshot().events;
	expect(trace.endReason).toBe('resumed');
	expect(trace.handles).toHaveLength(2);
	expect(trace.handles.every((handle) => handle.releasedAt !== null)).toBe(
		true,
	);
	expect(trace.handles[0].createdAt).toBeLessThanOrEqual(trace.startedAt);
	expect(trace.handles[1].createdAt).toBeGreaterThanOrEqual(trace.startedAt);
	bufferingDiagnostics.clear();
	expect(bufferingDiagnostics.getSnapshot().events).toEqual([]);
	expect(readIsBuffering()).toBe(false);
	expect(playbackDiagnostics.bufferingStatesTriggered).toBe(statesBefore + 1);
});

test('a block added and removed within the same commit emits no events', () => {
	const statesBefore = playbackDiagnostics.bufferingStatesTriggered;
	bufferingDiagnostics.setEnabled('webmcp', true);
	render(<Provider />);

	act(() => {
		const block = manager!.addBlock(null);
		block.unblock();
	});

	expect(events).toEqual([]);
	expect(readIsBuffering()).toBe(false);
	expect(playbackDiagnostics.bufferingStatesTriggered).toBe(statesBefore);
	expect(bufferingDiagnostics.getSnapshot().events).toEqual([]);
});

test('a subscriber registered while buffering receives the resume transition', () => {
	bufferingDiagnostics.setEnabled('panel', true);
	let shouldSubscribe = false;
	let resumed = false;

	const LateSubscriber: React.FC<{readonly generation: number}> = ({
		generation,
	}) => {
		const {subscribeBuffering} = useContext(SetTimelineContext);

		useLayoutEffect(() => {
			if (!shouldSubscribe) {
				return;
			}

			return subscribeBuffering((state) => {
				if (!state.buffering) {
					resumed = true;
				}
			});
		}, [generation, subscribeBuffering]);

		return null;
	};

	const {rerender, unmount} = render(
		<Provider>
			<LateSubscriber generation={1} />
		</Provider>,
	);

	let block: {unblock: () => void} | null = null;
	act(() => {
		block = manager!.addBlock(null);
	});
	expect(readIsBuffering()).toBe(true);

	shouldSubscribe = true;
	act(() => {
		rerender(
			<Provider>
				<LateSubscriber generation={2} />
			</Provider>,
		);
		block!.unblock();
	});

	expect(readIsBuffering()).toBe(false);
	expect(resumed).toBe(true);
	act(() => {
		manager!.addBlock(null);
	});
	bufferingDiagnostics.setEnabled('webmcp', false);
	expect(bufferingDiagnostics.isEnabled()).toBe(true);
	unmount();
	expect(bufferingDiagnostics.getSnapshot().events.at(-1)?.endReason).toBe(
		'unmounted',
	);
});

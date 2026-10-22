import {beforeEach, expect, test} from 'bun:test';
import {act, render} from '@testing-library/react';
import React, {useContext, useLayoutEffect} from 'react';
import {BufferingContextReact, BufferingProvider} from '../buffering.js';
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
});

test('does not emit "resume" on mount', () => {
	render(<Provider />);
	expect(events).toEqual([]);
});

test('emits "waiting" and "resume" only on empty <-> non-empty transitions', () => {
	render(<Provider />);

	let firstBlock: {unblock: () => void} | null = null;
	let secondBlock: {unblock: () => void} | null = null;

	act(() => {
		firstBlock = manager!.addBlock();
	});
	expect(events).toEqual(['waiting']);
	expect(readIsBuffering()).toBe(true);

	act(() => {
		secondBlock = manager!.addBlock();
	});
	expect(events).toEqual(['waiting']);

	act(() => {
		firstBlock!.unblock();
	});
	expect(events).toEqual(['waiting']);
	expect(readIsBuffering()).toBe(true);

	act(() => {
		secondBlock!.unblock();
	});
	expect(events).toEqual(['waiting', 'resume']);
	expect(readIsBuffering()).toBe(false);
});

test('a block added and removed within the same commit emits no events', () => {
	render(<Provider />);

	act(() => {
		const block = manager!.addBlock();
		block.unblock();
	});

	expect(events).toEqual([]);
	expect(readIsBuffering()).toBe(false);
});

test('a subscriber registered while buffering receives the resume transition', () => {
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

	const {rerender} = render(
		<Provider>
			<LateSubscriber generation={1} />
		</Provider>,
	);

	let block: {unblock: () => void} | null = null;
	act(() => {
		block = manager!.addBlock();
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
});

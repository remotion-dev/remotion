import {beforeEach, expect, test} from 'bun:test';
import {act, render} from '@testing-library/react';
import React, {useContext, useLayoutEffect} from 'react';
import {BufferingContextReact, BufferingProvider} from '../buffering.js';
import type {RemotionEnvironment} from '../remotion-environment-context.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';

const previewEnvironment: RemotionEnvironment = {
	isStudio: false,
	isRendering: false,
	isPlayer: true,
	isReadOnlyStudio: false,
	isClientSideRendering: false,
};

let manager: React.ContextType<typeof BufferingContextReact> = null;
let events: string[] = [];

const Harness: React.FC = () => {
	const context = useContext(BufferingContextReact);
	manager = context;

	// Subscribe in a layout effect like `useBufferStateEmitter` does, so that
	// listeners are registered before the provider's effects run on mount.
	useLayoutEffect(() => {
		const buffer = context!.listenForBuffering(() => {
			events.push('waiting');
		});
		const resume = context!.listenForResume(() => {
			events.push('resume');
		});

		return () => {
			buffer.remove();
			resume.remove();
		};
	}, [context]);

	return null;
};

const renderProvider = () => {
	return render(
		<RemotionEnvironmentContext.Provider value={previewEnvironment}>
			<BufferingProvider>
				<Harness />
			</BufferingProvider>
		</RemotionEnvironmentContext.Provider>,
	);
};

beforeEach(() => {
	manager = null;
	events = [];
});

test('does not emit "resume" on mount', () => {
	renderProvider();

	expect(events).toEqual([]);
});

test('emits "waiting" and "resume" only on empty <-> non-empty transitions', () => {
	renderProvider();

	let firstBlock: {unblock: () => void} | null = null;
	let secondBlock: {unblock: () => void} | null = null;

	act(() => {
		firstBlock = manager!.addBlock({id: 'first'});
	});
	expect(events).toEqual(['waiting']);
	expect(manager!.buffering.current).toBe(true);

	// A second block while already buffering must not re-dispatch "waiting"
	act(() => {
		secondBlock = manager!.addBlock({id: 'second'});
	});
	expect(events).toEqual(['waiting']);

	// Going from 2 -> 1 blocks is not a transition
	act(() => {
		firstBlock!.unblock();
	});
	expect(events).toEqual(['waiting']);
	expect(manager!.buffering.current).toBe(true);

	act(() => {
		secondBlock!.unblock();
	});
	expect(events).toEqual(['waiting', 'resume']);
	expect(manager!.buffering.current).toBe(false);
});

test('a block added and removed within the same commit emits no events', () => {
	renderProvider();

	act(() => {
		const block = manager!.addBlock({id: 'transient'});
		block.unblock();
	});

	expect(events).toEqual([]);
	expect(manager!.buffering.current).toBe(false);
});

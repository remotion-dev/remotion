import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {CompositionManagerRefContext} from './CompositionManagerContext';
import type {LogLevel} from './log';
import {LogLevelContext} from './log-level-context';
import {
	bufferingDiagnostics,
	playbackDiagnostics,
	type BufferingTraceSource,
} from './playback-diagnostics';
import {playbackLogging} from './playback-logging';
import {SetTimelineContext} from './TimelineContext.js';
import {useRemotionEnvironment} from './use-remotion-environment';

type BufferManager = {
	addBlock: (getSource: (() => BufferingTraceSource) | null) => {
		unblock: () => void;
	};
};

const useBufferManager = (
	logLevel: LogLevel,
	mountTime: number | null,
	setBuffering: (buffering: boolean) => void,
	isBuffering: () => boolean,
): BufferManager => {
	const [{blockCount, handles}, setBlocks] = useState<{
		blockCount: number;
		handles: NonNullable<
			ReturnType<typeof bufferingDiagnostics.createHandle>
		>[];
	}>({blockCount: 0, handles: []});
	const event =
		useRef<ReturnType<typeof bufferingDiagnostics.startEvent>>(null);
	const composition = useContext(CompositionManagerRefContext);
	const {frameRef} = useContext(SetTimelineContext);
	const getPosition = useCallback(() => {
		const content = composition.current.canvasContent;
		const compositionId =
			content?.type === 'composition' ? content.compositionId : null;
		return {
			compositionId,
			frame:
				compositionId === null ? 0 : (frameRef.current[compositionId] ?? 0),
		};
	}, [composition, frameRef]);

	const env = useRemotionEnvironment();
	const rendering = env.isRendering;

	const addBlock = useCallback(
		(getSource: (() => BufferingTraceSource) | null) => {
			if (rendering) {
				return {
					unblock: () => undefined,
				};
			}

			playbackDiagnostics.bufferingHandlesCreated++;
			const tracedHandle = bufferingDiagnostics.createHandle(getSource);

			if (event.current && event.current.endedAt === null) {
				bufferingDiagnostics.addHandle(event.current, tracedHandle);
			}

			let unblocked = false;

			setBlocks((current) => ({
				blockCount: current.blockCount + 1,
				handles: tracedHandle
					? [...current.handles, tracedHandle]
					: current.handles,
			}));
			return {
				unblock: () => {
					if (unblocked) {
						return;
					}

					unblocked = true;
					if (tracedHandle) {
						bufferingDiagnostics.releaseHandle(
							tracedHandle,
							getPosition().frame,
						);
					}

					setBlocks((current) => ({
						blockCount: current.blockCount - 1,
						handles: tracedHandle
							? current.handles.filter((handle) => handle !== tracedHandle)
							: current.handles,
					}));
				},
			};
		},
		[getPosition, rendering],
	);

	useEffect(() => {
		if (rendering) {
			return;
		}

		// Only fire on the `false -> true` transition: adding a block while
		// already buffering (e.g. a second media element starts loading) must
		// not re-dispatch `waiting` to listeners.
		if (blockCount > 0 && !isBuffering()) {
			playbackDiagnostics.bufferingStatesTriggered++;
			event.current = bufferingDiagnostics.startEvent({
				...getPosition(),
				handles,
				untracedHandles: blockCount - handles.length,
			});
			setBuffering(true);
			playbackLogging({
				logLevel,
				message: 'Player is entering buffer state',
				mountTime,
				tag: 'player',
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [blockCount]);

	if (typeof window !== 'undefined') {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useLayoutEffect(() => {
			if (rendering) {
				return;
			}

			// Only fire on the `true -> false` transition: the initial mount and
			// a block that was added and removed within the same commit must not
			// dispatch `resume` to listeners.
			if (blockCount === 0 && isBuffering()) {
				if (event.current) {
					bufferingDiagnostics.endEvent(event.current, 'resumed');
					event.current = null;
				}

				setBuffering(false);
				playbackLogging({
					logLevel,
					message: 'Player is exiting buffer state',
					mountTime,
					tag: 'player',
				});
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [blockCount]);
	}

	useEffect(
		() => () => {
			if (event.current) {
				bufferingDiagnostics.endEvent(event.current, 'unmounted');
				event.current = null;
			}
		},
		[],
	);

	return useMemo(() => ({addBlock}), [addBlock]);
};

export const BufferingContextReact = React.createContext<BufferManager | null>(
	null,
);

export const BufferingProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {logLevel, mountTime} = useContext(LogLevelContext);
	const {isBuffering, setBuffering} = useContext(SetTimelineContext);
	const bufferManager = useBufferManager(
		logLevel ?? 'info',
		mountTime,
		setBuffering,
		isBuffering,
	);

	return (
		<BufferingContextReact.Provider value={bufferManager}>
			{children}
		</BufferingContextReact.Provider>
	);
};

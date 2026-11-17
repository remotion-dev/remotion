import React, {
	useCallback,
	useContext,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import {flushSync} from 'react-dom';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';

type Sequence = React.ContextType<
	typeof Internals.SequenceManagerRefContext
>['current'][number];

export type TimeUpdaterRef = {
	update: (frame: number, reset?: Iterable<() => void>) => void;
	getSequences: () => readonly Sequence[];
};

const AudioClock: React.FC<{
	readonly children: React.ReactNode;
	readonly frame: number;
	readonly timeUpdater: React.RefObject<TimeUpdaterRef | null>;
	readonly update: TimeUpdaterRef['update'];
	readonly enabled: boolean;
}> = ({children, frame, update, timeUpdater, enabled}) => {
	const timeline = Internals.useTimelineContext();
	const sequences = useContext(Internals.SequenceManagerRefContext);
	useImperativeHandle(
		timeUpdater,
		() => ({
			update,
			getSequences: () => sequences.current,
		}),
		[sequences, update],
	);
	const audioTimeline = useMemo(
		() => ({...timeline, clientAudioOutputFrame: frame}),
		[frame, timeline],
	);

	return enabled ? (
		<Internals.SequenceRegistrationContext.Provider value>
			<Internals.TimelineContext.Provider value={audioTimeline}>
				{children}
			</Internals.TimelineContext.Provider>
		</Internals.SequenceRegistrationContext.Provider>
	) : (
		children
	);
};

export const UpdateTime: React.FC<{
	readonly children: React.ReactNode;
	readonly audioEnabled: boolean;
	readonly sampleRate: number | null;
	readonly videoEnabled: boolean;
	readonly logLevel: LogLevel;
	readonly compId: string;
	readonly initialFrame: number;
	readonly timeUpdater: React.RefObject<TimeUpdaterRef | null>;
}> = ({
	children,
	audioEnabled,
	sampleRate,
	videoEnabled,
	logLevel,
	compId,
	initialFrame,
	timeUpdater,
}) => {
	const [frame, setFrame] = useState(initialFrame);

	const update = useCallback(
		(nextFrame: number, reset: Iterable<() => void> = []) => {
			flushSync(() => {
				for (const callback of reset) callback();
				setFrame(nextFrame);
			});
		},
		[],
	);

	return (
		<Internals.RemotionRootContexts
			_experimentalKeepAudioContextAlive={false}
			audioEnabled={audioEnabled}
			videoEnabled={videoEnabled}
			logLevel={logLevel}
			numberOfAudioTags={0}
			audioLatencyHint="interactive"
			previewSampleRate={sampleRate}
			frameState={{
				[compId]: frame,
			}}
		>
			<AudioClock
				frame={frame}
				enabled={audioEnabled && !videoEnabled}
				update={update}
				timeUpdater={timeUpdater}
			>
				{children}
			</AudioClock>
		</Internals.RemotionRootContexts>
	);
};

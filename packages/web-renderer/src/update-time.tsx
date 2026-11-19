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
	update: (frame: number, reset: Iterable<() => void> | null) => void;
	setAudioOnly: (audioOnly: boolean) => void;
	getSequences: () => readonly Sequence[];
};

const AudioClock: React.FC<{
	readonly children: React.ReactNode;
	readonly frame: number;
	readonly timeUpdater: React.RefObject<TimeUpdaterRef | null>;
	readonly update: TimeUpdaterRef['update'];
	readonly enabled: boolean;
	readonly videoEnabled: boolean;
	readonly setAudioOnly: TimeUpdaterRef['setAudioOnly'];
}> = ({
	children,
	frame,
	update,
	timeUpdater,
	enabled,
	videoEnabled,
	setAudioOnly,
}) => {
	const timeline = Internals.useTimelineContext();
	const sequences = useContext(Internals.SequenceManagerRefContext);
	useImperativeHandle(
		timeUpdater,
		() => ({
			update,
			setAudioOnly,
			getSequences: () => sequences.current,
		}),
		[sequences, update, setAudioOnly],
	);
	const audioTimeline = useMemo(
		() => ({
			...timeline,
			clientAudioOutputFrame: frame,
			clientAudioVideoEnabled: videoEnabled,
		}),
		[frame, timeline, videoEnabled],
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
	const [audioOnly, setAudioOnly] = useState(false);

	const update = useCallback(
		(nextFrame: number, reset: Iterable<() => void> | null) => {
			flushSync(() => {
				for (const callback of reset ?? []) callback();
				setAudioOnly(false);
				setFrame(nextFrame);
			});
		},
		[],
	);

	return (
		<Internals.RemotionRootContexts
			_experimentalKeepAudioContextAlive={false}
			audioEnabled={audioEnabled}
			videoEnabled={videoEnabled && !audioOnly}
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
				enabled={audioEnabled}
				videoEnabled={videoEnabled}
				update={update}
				setAudioOnly={setAudioOnly}
				timeUpdater={timeUpdater}
			>
				{children}
			</AudioClock>
		</Internals.RemotionRootContexts>
	);
};

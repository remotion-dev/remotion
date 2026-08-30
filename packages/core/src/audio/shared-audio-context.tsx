import React, {
	createContext,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import {useLogLevel} from '../log-level-context.js';
import {Log} from '../log.js';
import {useTimelineContext} from '../timeline-position-state.js';
import type {RemotionAudioContextState} from './use-audio-context.js';
import {useSingletonAudioContext} from './use-audio-context.js';
import {
	type AudioContextResumeResult,
	waitUntilActuallyResumed,
} from './wait-until-actually-resumed.js';

export type ScheduleAudioNodeResult =
	| {
			type: 'started';
			scheduledTime: number;
	  }
	| {
			type: 'not-started';
			reason: string;
	  };

export type ScheduleAudioNodeOptions = {
	readonly node: AudioBufferSourceNode;
	readonly mediaTimestamp: number;
	readonly sourceOffset: number;
	readonly scheduledTime: number;
	readonly originalUnloopedMediaTimestamp: number;
	readonly duration: number;
	readonly offset: number;
};

export type AudioSyncAnchorEvent = 'changed';

export type AudioSyncAnchorListener = (event: AudioSyncAnchorEvent) => void;

export type AudioSyncAnchorEmitter = {
	dispatch: (event: AudioSyncAnchorEvent) => void;
	subscribe: (listener: AudioSyncAnchorListener) => {remove: () => void};
};

export type SharedAudioContextValue = {
	audioContext: AudioContext | null;
	getAudioContextState: () => RemotionAudioContextState | null;
	gainNode: GainNode | null;
	audioSyncAnchor: {value: number};
	audioSyncAnchorEmitter: AudioSyncAnchorEmitter;
	scheduleAudioNode: (
		options: ScheduleAudioNodeOptions,
	) => ScheduleAudioNodeResult;
	resume: () => Promise<void>;
	suspend: () => Promise<void>;
	getIsResumingAudioContext: () => Promise<AudioContextResumeResult> | null;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => void;
	_experimentalKeepAudioContextAlive: boolean;
};

export const SharedAudioContext = createContext<SharedAudioContextValue | null>(
	null,
);

type NodeToResume = {
	scheduledTime: number;
	offset: number;
	duration: number;
};

type AudioContextResumeAttempt = {
	abortController: AbortController;
	id: number;
	promise: Promise<AudioContextResumeResult>;
};

const shouldSaveForLater = (
	state: Exclude<RemotionAudioContextState, 'closed'>,
) => {
	if (
		state === 'suspended' ||
		state === 'running-to-suspended' ||
		state === 'interrupted'
	) {
		return true;
	}

	if (state === 'running' || state === 'suspended-to-running') {
		return false;
	}

	throw new Error(`Unexpected audio context state: ${state satisfies never}`);
};

export const SharedAudioContextProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly audioLatencyHint: AudioContextLatencyCategory;
	readonly audioEnabled: boolean;
	readonly previewSampleRate: number | null;
	readonly _experimentalKeepAudioContextAlive: boolean;
}> = ({
	children,
	audioLatencyHint,
	audioEnabled,
	previewSampleRate,
	_experimentalKeepAudioContextAlive,
}) => {
	const logLevel = useLogLevel();
	const sampleRate = previewSampleRate ?? 48000;

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		window.remotion_sampleRate = sampleRate;
	}, [sampleRate]);

	const ctxAndGain = useSingletonAudioContext({
		logLevel,
		latencyHint: audioLatencyHint,
		audioEnabled,
		sampleRate,
	});
	const audioContextIsPlayingEventually = useRef(false);
	const initialExperimentalKeepAudioContextAlive = useRef(
		_experimentalKeepAudioContextAlive,
	);

	if (
		initialExperimentalKeepAudioContextAlive.current !==
		_experimentalKeepAudioContextAlive
	) {
		throw new Error(
			'`_experimentalKeepAudioContextAlive` cannot be changed dynamically.',
		);
	}

	const isResuming = useRef<AudioContextResumeAttempt | null>(null);
	const nextResumeAttemptId = useRef(0);

	const audioSyncAnchor = useMemo(() => ({value: 0}), []);

	const audioSyncAnchorListeners = useRef<AudioSyncAnchorListener[]>([]);
	const audioSyncAnchorEmitter: AudioSyncAnchorEmitter = useMemo(() => {
		return {
			dispatch: (event) => {
				audioSyncAnchorListeners.current.forEach((l) => l(event));
			},
			subscribe: (listener) => {
				audioSyncAnchorListeners.current.push(listener);
				return {
					remove: () => {
						audioSyncAnchorListeners.current =
							audioSyncAnchorListeners.current.filter((l) => l !== listener);
					},
				};
			},
		};
	}, []);

	const prevEndTimes = useRef<{
		scheduledEndTime: number | null;
		mediaEndTime: number | null;
	}>({scheduledEndTime: null, mediaEndTime: null});

	const nodesToResume = useRef<Map<AudioBufferSourceNode, NodeToResume>>(
		new Map(),
	);

	const unscheduleAudioNode = useCallback((node: AudioBufferSourceNode) => {
		nodesToResume.current.delete(node);
	}, []);

	const scheduleAudioNode = useMemo(() => {
		return ({
			node,
			mediaTimestamp,
			sourceOffset,
			scheduledTime,
			duration,
			offset,
			originalUnloopedMediaTimestamp,
		}: ScheduleAudioNodeOptions): ScheduleAudioNodeResult => {
			if (!ctxAndGain) {
				throw new Error('Audio context not found');
			}

			const currentState = ctxAndGain.getState();

			if (currentState === 'closed') {
				return {
					type: 'not-started',
					reason: 'audio context is closed',
				};
			}

			// With _experimentalKeepAudioContextAlive, the native context stays
			// `running` while silenced, so the state alone does not reveal that playback
			// is paused. Queue the node like the suspend path does, otherwise it
			// would start right away at a stale position and become audible when
			// the gain ramps back up.
			const saveForLater =
				shouldSaveForLater(currentState) ||
				(_experimentalKeepAudioContextAlive &&
					!audioContextIsPlayingEventually.current);

			if (duration > 0) {
				if (saveForLater) {
					nodesToResume.current.set(node, {
						scheduledTime,
						offset,
						duration,
					});
				} else {
					node.start(scheduledTime, offset, duration);
				}
			}

			const scheduledEndTime =
				scheduledTime + duration / node.playbackRate.value;

			const mediaTime = mediaTimestamp + offset - sourceOffset;

			const mediaEndTime = mediaTime + duration;

			const latency =
				ctxAndGain.audioContext.baseLatency +
				ctxAndGain.audioContext.outputLatency;
			const timeDiff = scheduledTime - ctxAndGain.audioContext.currentTime;
			const prev = prevEndTimes.current;
			const scheduledMismatch =
				prev.scheduledEndTime !== null &&
				Math.abs(scheduledTime - prev.scheduledEndTime) > 0.001;
			const mediaMismatch =
				prev.mediaEndTime !== null &&
				Math.abs(mediaTime - prev.mediaEndTime) > 0.001;

			Log.verbose(
				{logLevel, tag: 'audio-scheduling'},
				'scheduled %c%s%c %s %c%s%c %s %c%s%c %s %s %s %s %s',
				scheduledMismatch ? 'color: red; font-weight: bold' : '',
				scheduledTime.toFixed(4),
				'',
				scheduledEndTime.toFixed(4),
				mediaMismatch ? 'color: red; font-weight: bold' : '',
				mediaTime.toFixed(4),
				'',
				mediaEndTime.toFixed(4),
				timeDiff < latency ? 'color: red; font-weight: bold' : '',
				timeDiff.toFixed(4),
				'',
				Math.abs(mediaTime - originalUnloopedMediaTimestamp) > 0.001
					? 'looped'
					: 'original',
				saveForLater ? 'paused' : 'playing',
				latency.toFixed(4),
				ctxAndGain.audioContext.currentTime.toFixed(4),
			);

			prevEndTimes.current = {
				scheduledEndTime,
				mediaEndTime,
			};

			return {
				type: 'started',
				scheduledTime,
			};
		};
	}, [ctxAndGain, _experimentalKeepAudioContextAlive, logLevel]);

	const getIsResumingAudioContext = useCallback(() => {
		return isResuming.current ? isResuming.current.promise : null;
	}, []);

	const resume = useCallback(async () => {
		if (!ctxAndGain) {
			return;
		}

		if (isResuming.current) {
			return isResuming.current.promise.then(() => undefined);
		}

		if (ctxAndGain.getState() === 'running') {
			audioContextIsPlayingEventually.current = true;
			return;
		}

		const id = nextResumeAttemptId.current++;

		if (!_experimentalKeepAudioContextAlive) {
			// This happens after nodes have been scheduled. Because `ctx.resume()` is
			// async and has some delay, time will have passed and the scheduled times
			// are out of date and late. Re-anchor the base time so the audio nodes play
			// at the right time.
			audioSyncAnchor.value = ctxAndGain.audioContext.currentTime;
			audioSyncAnchorEmitter.dispatch('changed');
		}

		const abortController = new AbortController();

		const promise = waitUntilActuallyResumed(
			ctxAndGain.audioContext,
			logLevel,
			abortController.signal,
		);

		isResuming.current = {
			abortController,
			id,
			promise,
		};
		const onComplete = () => {
			if (isResuming.current?.id === id) {
				isResuming.current = null;
			}
		};

		promise.then(onComplete, onComplete);

		audioContextIsPlayingEventually.current = true;

		if (!_experimentalKeepAudioContextAlive) {
			nodesToResume.current.forEach((value, node) => {
				const timeSinceItWasSupposedToPlay =
					ctxAndGain.audioContext.currentTime - value.scheduledTime;
				try {
					node.start(
						value.scheduledTime,
						value.offset + timeSinceItWasSupposedToPlay,
						value.duration - timeSinceItWasSupposedToPlay,
					);
				} catch (err) {
					// Invalid state error = the audio already ended
				}
			});

			nodesToResume.current.clear();
		}

		await ctxAndGain.resume();
		await promise;
	}, [
		ctxAndGain,
		_experimentalKeepAudioContextAlive,
		audioSyncAnchor,
		audioSyncAnchorEmitter,
	]);

	const suspend = useCallback(async () => {
		if (!ctxAndGain) {
			return;
		}

		audioContextIsPlayingEventually.current = false;
		if (_experimentalKeepAudioContextAlive) {
			return;
		}

		if (isResuming.current) {
			isResuming.current.abortController.abort();
			isResuming.current = null;
		}

		return ctxAndGain.suspend();
	}, [ctxAndGain, _experimentalKeepAudioContextAlive]);

	useTimelineContext({
		subscriber: useCallback(
			(playing: boolean) => {
				if (playing) {
					resume();
				} else {
					suspend();
				}
			},
			[resume, suspend],
		),
	});

	useEffect(() => {
		if (!ctxAndGain) {
			return;
		}

		if (!_experimentalKeepAudioContextAlive) {
			return;
		}

		const wake = () => {
			if (ctxAndGain.audioContext.state === 'running') {
				return;
			}

			ctxAndGain.resume().catch(() => {
				// A rejection here means autoplay is still blocked; a later
				// gesture will retry.
			});
		};

		wake();
		window.addEventListener('pointerdown', wake, {
			capture: true,
			passive: true,
		});
		window.addEventListener('keydown', wake, {capture: true, passive: true});

		return () => {
			window.removeEventListener('pointerdown', wake, {capture: true});
			window.removeEventListener('keydown', wake, {capture: true});
			ctxAndGain.suspend().catch(() => {});
		};
	}, [ctxAndGain, _experimentalKeepAudioContextAlive]);

	const audioContextValue: SharedAudioContextValue = useMemo(() => {
		return {
			audioContext: ctxAndGain?.audioContext ?? null,
			getAudioContextState: () => ctxAndGain?.getState() ?? null,
			gainNode: ctxAndGain?.gainNode ?? null,
			audioSyncAnchor,
			audioSyncAnchorEmitter,
			scheduleAudioNode,
			resume,
			suspend,
			getIsResumingAudioContext,
			unscheduleAudioNode,
			_experimentalKeepAudioContextAlive,
		};
	}, [
		ctxAndGain,
		audioSyncAnchor,
		audioSyncAnchorEmitter,
		scheduleAudioNode,
		resume,
		suspend,
		getIsResumingAudioContext,
		unscheduleAudioNode,
		_experimentalKeepAudioContextAlive,
	]);

	return (
		<SharedAudioContext.Provider value={audioContextValue}>
			{children}
		</SharedAudioContext.Provider>
	);
};

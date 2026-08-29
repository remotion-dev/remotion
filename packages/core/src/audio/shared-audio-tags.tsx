import React, {
	createContext,
	createRef,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type AudioHTMLAttributes,
} from 'react';
import {useLogLevel, useMountTime} from '../log-level-context.js';
import {Log} from '../log.js';
import {playAndHandleNotAllowedError} from '../play-and-handle-not-allowed-error.js';
import {useRemotionEnvironment} from '../use-remotion-environment.js';
import type {PlaybackTransport} from './playback-transport.js';
import {makePlaybackTransport} from './playback-transport.js';
import type {SharedElementSourceNode} from './shared-element-source-node.js';
import {makeSharedElementSourceNode} from './shared-element-source-node.js';
import type {RemotionAudioContextState} from './use-audio-context.js';
import {useSingletonAudioContext} from './use-audio-context.js';
import {
	type AudioContextResumeResult,
	waitUntilActuallyResumed,
} from './wait-until-actually-resumed.js';

/**
 * This functionality of Remotion will keep a certain amount
 * of <audio> tags pre-mounted and by default filled with an empty audio track.
 * If the user interacts, the empty audio will be played.
 * If one of Remotions <Html5Audio /> tags get mounted, the audio will not be rendered at this location, but into one of the prerendered audio tags.
 *
 * This helps with autoplay issues on iOS Safari and soon other browsers,
 * which only allow audio playback upon user interaction.
 *
 * The behavior can be disabled by passing `0` as the number of shared audio tracks.
 */

type AudioElem = {
	id: number;
	props: AudioHTMLAttributes<HTMLAudioElement>;
	el: React.RefObject<HTMLAudioElement | null>;
	audioId: string;
	mediaElementSourceNode: SharedElementSourceNode | null;
	premounting: boolean;
	postmounting: boolean;
	audioMounted: boolean;
	cleanupOnMediaTagUnmount: () => void;
};

const EMPTY_AUDIO =
	'data:audio/mp3;base64,/+MYxAAJcAV8AAgAABn//////+/gQ5BAMA+D4Pg+BAQBAEAwD4Pg+D4EBAEAQDAPg++hYBH///hUFQVBUFREDQNHmf///////+MYxBUGkAGIMAAAAP/29Xt6lUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDUAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

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

type SharedAudioContextValue = {
	audioContext: AudioContext | null;
	getAudioContextState: () => RemotionAudioContextState | null;
	gainNode: GainNode | null;
	audioSyncAnchor: {value: number};
	audioSyncAnchorEmitter: AudioSyncAnchorEmitter;
	playbackTransport: PlaybackTransport;
	scheduleAudioNode: (
		options: ScheduleAudioNodeOptions,
	) => ScheduleAudioNodeResult;
	resume: () => Promise<void>;
	suspend: () => Promise<void>;
	getIsResumingAudioContext: () => Promise<AudioContextResumeResult> | null;
	unscheduleAudioNode: (node: AudioBufferSourceNode) => void;
	_experimentalKeepAudioContextAlive: boolean;
};

type SharedAudioTagsContextValue = {
	registerAudio: (options: {
		aud: AudioHTMLAttributes<HTMLAudioElement>;
		audioId: string;
		premounting: boolean;
		postmounting: boolean;
	}) => AudioElem;
	unregisterAudio: (id: number) => void;
	updateAudio: (options: {
		id: number;
		aud: AudioHTMLAttributes<HTMLAudioElement>;
		audioId: string;
		premounting: boolean;
		postmounting: boolean;
	}) => void;
	playAllAudios: () => void;
	numberOfAudioTags: number;
};

const compareProps = (
	obj1: Record<string, unknown>,
	obj2: Record<string, unknown>,
) => {
	const keysA = Object.keys(obj1).sort();
	const keysB = Object.keys(obj2).sort();
	if (keysA.length !== keysB.length) {
		return false;
	}

	for (let i = 0; i < keysA.length; i++) {
		// Not the same keys
		if (keysA[i] !== keysB[i]) {
			return false;
		}

		// Not the same values
		if (obj1[keysA[i]] !== obj2[keysB[i]]) {
			return false;
		}
	}

	return true;
};

const didPropChange = (key: string, newProp: unknown, prevProp: unknown) => {
	// /music.mp3 and http://localhost:3000/music.mp3 are the same
	if (
		key === 'src' &&
		!(prevProp as string).startsWith('data:') &&
		!(newProp as string).startsWith('data:')
	) {
		return (
			new URL(prevProp as string, window.origin).toString() !==
			new URL(newProp as string, window.origin).toString()
		);
	}

	if (prevProp === newProp) {
		return false;
	}

	return true;
};

type Ref = {
	id: number;
	ref: React.RefObject<HTMLAudioElement | null>;
	mediaElementSourceNode: SharedElementSourceNode | null;
};

export const SharedAudioContext = createContext<SharedAudioContextValue | null>(
	null,
);

export const SharedAudioTagsContext =
	createContext<SharedAudioTagsContextValue | null>(null);

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
	const playbackTransport = useMemo(() => makePlaybackTransport(), []);
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
				(_experimentalKeepAudioContextAlive && !playbackTransport.getPlaying());

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
				duration < 0
					? 'color: red; font-weight: bold'
					: timeDiff < 0
						? 'color: red; font-weight: bold'
						: 'color: blue; font-weight: bold',
				duration < 0
					? 'missed ' + Math.abs(offset).toFixed(2) + 's'
					: Math.abs(timeDiff).toFixed(2) +
							(timeDiff < 0 ? ' delay' : ' ahead'),
				'',
				'current=' + ctxAndGain.audioContext.currentTime.toFixed(4),
				'offset=' + offset.toFixed(4),
				'latency=' + latency.toFixed(4),
				'state=' + ctxAndGain.audioContext.state,
				originalUnloopedMediaTimestamp !== mediaTime
					? 'original_ts=' + originalUnloopedMediaTimestamp.toFixed(4)
					: '',
				'action=' + (saveForLater ? 'schedule' : 'start'),
				'',
			);

			prev.scheduledEndTime = scheduledEndTime;
			prev.mediaEndTime = mediaEndTime;

			return duration > 0
				? {
						type: 'started',
						scheduledTime,
					}
				: {
						type: 'not-started',
						reason: 'missed ' + Math.abs(offset).toFixed(2) + 's',
					};
		};
	}, [
		ctxAndGain,
		_experimentalKeepAudioContextAlive,
		logLevel,
		playbackTransport,
	]);

	const resume = useCallback(() => {
		if (!ctxAndGain) {
			return Promise.resolve();
		}

		if (playbackTransport.getPlaying()) {
			return Promise.resolve();
		}

		playbackTransport.dispatch('play');

		ctxAndGain.gainNode.gain.cancelScheduledValues(
			ctxAndGain.audioContext.currentTime,
		);
		ctxAndGain.gainNode.gain.setValueAtTime(
			0,
			ctxAndGain.audioContext.currentTime,
		);
		ctxAndGain.gainNode.gain.linearRampToValueAtTime(
			1,
			ctxAndGain.audioContext.currentTime + 0.03,
		);

		nodesToResume.current.forEach((r, node) => {
			node.start(r.scheduledTime, r.offset, r.duration);
		});
		nodesToResume.current.clear();

		if (
			_experimentalKeepAudioContextAlive &&
			ctxAndGain.audioContext.state === 'running'
		) {
			// The context was never suspended, so there is nothing to wait for:
			// the resume-wait machinery, its timeout and the mute-on-failure
			// path are not entered.
			return Promise.resolve();
		}

		const resumePromise = ctxAndGain.resume();
		const abortController = new AbortController();
		const resumeAttemptId = nextResumeAttemptId.current++;

		const waitPromise = new Promise<AudioContextResumeResult>((resolve) => {
			waitUntilActuallyResumed(
				ctxAndGain.audioContext,
				logLevel,
				abortController.signal,
			).then(resolve);
			resumePromise.catch((err) => {
				Log.warn(
					{logLevel, tag: 'audio'},
					'AudioContext resume rejected, muting playback and continuing without audio',
					err,
				);
				abortController.abort();
				resolve('failed');
			});
		}).finally(() => {
			if (isResuming.current?.id === resumeAttemptId) {
				isResuming.current = null;
			}
		});
		isResuming.current = {
			abortController,
			id: resumeAttemptId,
			promise: waitPromise,
		};

		return resumePromise.catch(() => {
			// Already logged above; swallow to avoid unhandled rejection
			// since callers (e.g. use-playback.ts) do not await this.
		});
	}, [
		ctxAndGain,
		_experimentalKeepAudioContextAlive,
		logLevel,
		playbackTransport,
	]);

	const getIsResumingAudioContext = useCallback(() => {
		return isResuming.current?.promise ?? null;
	}, []);

	const suspend = useCallback(() => {
		isResuming.current?.abortController.abort();

		if (!ctxAndGain) {
			return Promise.resolve();
		}

		if (!playbackTransport.getPlaying()) {
			return Promise.resolve();
		}

		playbackTransport.dispatch('pause');

		if (_experimentalKeepAudioContextAlive) {
			// Silence through the gain instead of suspending, so the context
			// clock keeps running and the next resume() is instant. Audio that
			// is already scheduled plays out silently; resume() ramps the gain
			// back up.
			ctxAndGain.gainNode.gain.cancelScheduledValues(
				ctxAndGain.audioContext.currentTime,
			);
			ctxAndGain.gainNode.gain.setValueAtTime(
				0,
				ctxAndGain.audioContext.currentTime,
			);
			return Promise.resolve();
		}

		return ctxAndGain.suspend();
	}, [ctxAndGain, _experimentalKeepAudioContextAlive, playbackTransport]);

	// With _experimentalKeepAudioContextAlive, start the context as early as
	// possible so the first play never waits on the suspended→running transition. Where
	// no autoplay restriction applies (e.g. Electron with
	// `no-user-gesture-required`), the mount attempt succeeds immediately;
	// in a browser the first user gesture starts it. suspend() never reaches
	// the native context in this mode, so once running it stays running.
	// The cleanup suspends the native context, since Player contexts are
	// not close()d and must not be left running after unmount.
	useEffect(() => {
		if (!_experimentalKeepAudioContextAlive) {
			return;
		}

		if (!ctxAndGain) {
			return;
		}

		if (typeof window === 'undefined') {
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
			playbackTransport,
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
		playbackTransport,
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

export const SharedAudioTagsContextProvider: React.FC<{
	readonly numberOfAudioTags: number;
	readonly children: React.ReactNode;
}> = ({children, numberOfAudioTags}) => {
	const audios = useRef<AudioElem[]>([]);
	const [initialNumberOfAudioTags] = useState(numberOfAudioTags);

	if (numberOfAudioTags !== initialNumberOfAudioTags) {
		throw new Error(
			'The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.',
		);
	}

	const logLevel = useLogLevel();
	const mountTime = useMountTime();
	const env = useRemotionEnvironment();
	const audioCtx = useContext(SharedAudioContext);
	const audioContext = audioCtx?.audioContext ?? null;
	const resume = audioCtx?.resume;

	const [refs] = useState(() => {
		return new Array(numberOfAudioTags).fill(true).map((): Ref => {
			const ref = createRef<HTMLAudioElement>();
			return {
				id: Math.random(),
				ref,
				mediaElementSourceNode: makeSharedElementSourceNode({
					audioContext,
					ref,
				}),
			};
		});
	});

	for (const {mediaElementSourceNode} of refs) {
		mediaElementSourceNode?.setAudioContext(audioContext);
	}

	/**
	 * Effects in React 18 fire twice, and we are looking for a way to only fire it once.
	 * - useInsertionEffect only fires once. If it's available we are in React 18.
	 * - useLayoutEffect only fires once in React 17.
	 *
	 * Need to import it from React to fix React 17 ESM support.
	 */
	const effectToUse = React.useInsertionEffect ?? React.useLayoutEffect;

	// Disconnecting the SharedElementSourceNodes if the Player unmounts to prevent leak.
	// https://github.com/remotion-dev/remotion/issues/6285
	// But useInsertionEffect will fire before other effects, meaning the
	// nodes might still be used. Using rAF to ensure it's after other effects.
	effectToUse(() => {
		return () => {
			requestAnimationFrame(() => {
				refs.forEach(({mediaElementSourceNode}) => {
					mediaElementSourceNode?.cleanup();
				});
			});
		};
	}, [refs]);

	const takenAudios = useRef<(false | number)[]>(
		new Array(numberOfAudioTags).fill(false),
	);

	const rerenderAudios = useCallback(() => {
		refs.forEach(({ref, id}) => {
			const data = audios.current?.find((a) => a.id === id);
			const {current} = ref;
			if (!current) {
				// Whole player has been unmounted, the refs don't exist anymore.
				// It is not an error anymore though
				return;
			}

			if (data === undefined) {
				if (current.src !== EMPTY_AUDIO) {
					current.src = EMPTY_AUDIO;
				}

				return;
			}

			if (!data) {
				throw new TypeError('Expected audio data to be there');
			}

			Object.keys(data.props).forEach((key) => {
				// @ts-expect-error
				if (didPropChange(key, data.props[key], current[key])) {
					// @ts-expect-error
					current[key] = data.props[key];
				}
			});
		});
	}, [refs]);

	const registerAudio = useCallback(
		(options: {
			aud: AudioHTMLAttributes<HTMLAudioElement>;
			audioId: string;
			premounting: boolean;
			postmounting: boolean;
		}) => {
			const {aud, audioId, premounting, postmounting} = options;
			const found = audios.current?.find((a) => a.audioId === audioId);
			if (found) {
				return found;
			}

			const firstFreeAudio = takenAudios.current.findIndex((a) => a === false);
			if (firstFreeAudio === -1) {
				throw new Error(
					`Tried to simultaneously mount ${
						numberOfAudioTags + 1
					} <Html5Audio /> tags at the same time. With the current settings, the maximum amount of <Html5Audio /> tags is limited to ${numberOfAudioTags} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player/autoplay#using-the-numberofsharedaudiotags-prop for more information on how to increase this limit.`,
				);
			}

			const {id, ref, mediaElementSourceNode} = refs[firstFreeAudio];
			const cloned = [...takenAudios.current];
			cloned[firstFreeAudio] = id;
			takenAudios.current = cloned;

			const newElem: AudioElem = {
				props: aud,
				id,
				el: ref,
				audioId,
				mediaElementSourceNode,
				premounting,
				audioMounted: Boolean(ref.current),
				postmounting,
				cleanupOnMediaTagUnmount: () => {
					// Don't disconnect here, only when the Player unmounts.
				},
			};
			audios.current?.push(newElem);
			rerenderAudios();
			return newElem;
		},
		[numberOfAudioTags, refs, rerenderAudios],
	);

	const unregisterAudio = useCallback(
		(id: number) => {
			const cloned = [...takenAudios.current];
			const index = refs.findIndex((r) => r.id === id);
			if (index === -1) {
				throw new TypeError(
					`Unknown audio ref ${id}; refs: ${refs.map((r) => r.id).join(', ')}`,
				);
			}

			cloned[index] = false;

			takenAudios.current = cloned;
			audios.current = audios.current?.filter((a) => a.id !== id);

			rerenderAudios();
		},
		[refs, rerenderAudios],
	);

	const updateAudio = useCallback(
		({
			aud,
			audioId,
			id,
			premounting,
			postmounting,
		}: {
			id: number;
			aud: AudioHTMLAttributes<HTMLAudioElement>;
			audioId: string;
			premounting: boolean;
			postmounting: boolean;
		}) => {
			let changed = false;

			audios.current = audios.current?.map((prevA): AudioElem => {
				const audioMounted = Boolean(prevA.el.current);
				if (prevA.audioMounted !== audioMounted) {
					changed = true;
				}

				if (prevA.id === id) {
					const isTheSame =
						compareProps(
							aud as Record<string, unknown>,
							prevA.props as Record<string, unknown>,
						) &&
						prevA.premounting === premounting &&
						prevA.postmounting === postmounting;
					if (isTheSame) {
						return prevA.audioMounted === audioMounted
							? prevA
							: {...prevA, audioMounted};
					}

					changed = true;

					return {
						...prevA,
						props: aud,
						premounting,
						postmounting,
						audioId,
						audioMounted,
					};
				}

				return prevA.audioMounted === audioMounted
					? prevA
					: {...prevA, audioMounted};
			});

			if (changed) {
				rerenderAudios();
			}
		},
		[rerenderAudios],
	);

	const playAllAudios = useCallback(() => {
		refs.forEach((ref) => {
			const audio = audios.current.find((a) => a.el === ref.ref);
			if (audio?.premounting) {
				return;
			}

			playAndHandleNotAllowedError({
				mediaRef: ref.ref,
				mediaType: 'audio',
				onAutoPlayError: null,
				logLevel,
				mountTime,
				reason: 'playing all audios',
				isPlayer: env.isPlayer,
			});
		});
		resume?.();
	}, [logLevel, mountTime, refs, env.isPlayer, resume]);

	const audioTagsValue: SharedAudioTagsContextValue = useMemo(() => {
		return {
			registerAudio,
			unregisterAudio,
			updateAudio,
			playAllAudios,
			numberOfAudioTags,
		};
	}, [
		numberOfAudioTags,
		playAllAudios,
		registerAudio,
		unregisterAudio,
		updateAudio,
	]);
	const sharedAudioTagElements = useMemo(() => {
		return refs.map(({id, ref}) => {
			return (
				// Without preload="metadata", iOS will seek the time internally
				// but not actually with sound. Adding `preload="metadata"` helps here.
				// https://discord.com/channels/809501355504959528/817306414069710848/1130519583367888906
				<audio key={id} ref={ref} preload="metadata" src={EMPTY_AUDIO} />
			);
		});
	}, [refs]);

	return (
		<SharedAudioTagsContext.Provider value={audioTagsValue}>
			{sharedAudioTagElements}
			{children}
		</SharedAudioTagsContext.Provider>
	);
};

export const useSharedAudio = ({
	aud,
	audioId,
	premounting,
	postmounting,
}: {
	aud: AudioHTMLAttributes<HTMLAudioElement>;
	audioId: string;
	premounting: boolean;
	postmounting: boolean;
}) => {
	const audioCtx = useContext(SharedAudioContext);
	const tagsCtx = useContext(SharedAudioTagsContext);

	/**
	 * We work around this in React 18 so an audio tag will only register itself once
	 */
	const [elem] = useState((): AudioElem => {
		if (tagsCtx && tagsCtx.numberOfAudioTags > 0) {
			return tagsCtx.registerAudio({aud, audioId, premounting, postmounting});
		}

		// numberOfSharedAudioTags is 0
		const el = React.createRef<HTMLAudioElement>();
		const mediaElementSourceNode = makeSharedElementSourceNode({
			audioContext: audioCtx?.audioContext ?? null,
			ref: el,
		});

		return {
			el,
			id: Math.random(),
			props: aud,
			audioId,
			mediaElementSourceNode,
			premounting,
			audioMounted: Boolean(el.current),
			postmounting,
			cleanupOnMediaTagUnmount: () => {
				mediaElementSourceNode?.cleanup();
			},
		};
	});
	elem.mediaElementSourceNode?.setAudioContext(audioCtx?.audioContext ?? null);

	/**
	 * Effects in React 18 fire twice, and we are looking for a way to only fire it once.
	 * - useInsertionEffect only fires once. If it's available we are in React 18.
	 * - useLayoutEffect only fires once in React 17.
	 *
	 * Need to import it from React to fix React 17 ESM support.
	 */
	const effectToUse = React.useInsertionEffect ?? React.useLayoutEffect;

	if (typeof document !== 'undefined') {
		effectToUse(() => {
			if (tagsCtx && tagsCtx.numberOfAudioTags > 0) {
				tagsCtx.updateAudio({
					id: elem.id,
					aud,
					audioId,
					premounting,
					postmounting,
				});
			}
		}, [aud, tagsCtx, elem.id, audioId, premounting, postmounting]);

		effectToUse(() => {
			return () => {
				if (tagsCtx && tagsCtx.numberOfAudioTags > 0) {
					tagsCtx.unregisterAudio(elem.id);
				}
			};
		}, [tagsCtx, elem.id]);
	}

	return elem;
};

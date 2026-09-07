import type React from 'react';
import {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {
	Internals,
	useCurrentFrame,
	useVideoConfig,
	type ScheduleAudioNodeOptions,
	type ScheduleAudioNodeResult,
} from 'remotion';
import {MediaPlayer} from '../media-player';
import type {SharedAudioContextForMediaPlayer} from '../shared-audio-context-for-media-player';
import {scheduleAudioScheduleEntryGain} from './audio-scheduler-gain';
import {
	clampAudioSchedulerTime,
	isAudioSchedulerEntryInWindow,
} from './audio-scheduler-timeline';
import type {NormalizedAudioScheduleEntry} from './audio-scheduler-types';

const {SharedAudioContext, SequenceContext} = Internals;

// AudioScheduler is managed outside Remotion's normal <Audio> buffering
// lifecycle. It keeps a rolling window of entries mounted and synchronizes
// those players with the timeline and the shared audio anchor.
const NO_OP_BUFFER_STATE = {
	delayPlayback: () => ({unblock: () => {}}),
};

const AUDIO_SCHEDULER_SEEK_FADE_SECONDS = 0.01;
const AUDIO_SCHEDULER_GAIN_GUARD_SECONDS = 0.001;

const getGlobalEntryOffsetSeconds = (
	entry: NormalizedAudioScheduleEntry,
	schedulerStartTimeInSeconds: number,
) => schedulerStartTimeInSeconds + entry.startTimeInSeconds;

const getPlayerLocalTime = ({
	globalCompositionTime,
	entry,
	schedulerStartTimeInSeconds,
	fps,
}: {
	globalCompositionTime: number;
	entry: NormalizedAudioScheduleEntry;
	schedulerStartTimeInSeconds: number;
	fps: number;
}) => {
	return clampAudioSchedulerTime({
		durationInSeconds: entry.durationInSeconds,
		timeInSeconds:
			globalCompositionTime -
			getGlobalEntryOffsetSeconds(entry, schedulerStartTimeInSeconds),
		fps,
	});
};

type PlayerSlot = {
	player: MediaPlayer;
	gainNode: GainNode;
	entry: NormalizedAudioScheduleEntry;
	waitingForFirstAudio: boolean;
	lastRequestedLocalTime: number | null;
	seekGainMutedUntil: number | null;
	disposed: boolean;
};

type AudioSchedulerController = {
	syncToTime: (currentGlobalTime: number) => void;
};

/**
 * Preview implementation of AudioScheduler.
 *
 * Entries in the lookahead window get one MediaPlayer and one scheduler-owned
 * GainNode. A stable entry-ID map prevents an entry from being initialized
 * more than once while it remains in the window. Entries outside the rolling
 * window are disposed to keep long schedules from creating hundreds of media
 * iterators at once.
 */
export const AudioSchedulerPreview: React.FC<{
	readonly schedule: readonly NormalizedAudioScheduleEntry[];
}> = ({schedule}) => {
	const sharedAudioContext = useContext(SharedAudioContext);
	const {fps} = useVideoConfig();
	const frame = useCurrentFrame();
	const logLevel = Internals.useLogLevel();
	const frameRef = useRef(frame);
	frameRef.current = frame;

	const parentSequence = useContext(SequenceContext);
	const schedulerStartTimeInSeconds = (parentSequence?.absoluteFrom ?? 0) / fps;
	const holdGainUntilFirstAudio =
		sharedAudioContext?._experimentalKeepAudioContextAlive ?? false;

	const slotsRef = useRef<Map<string, PlayerSlot>>(new Map());
	const controllerRef = useRef<AudioSchedulerController | null>(null);

	// The scheduler's outer gain is the only place where entry volume and the
	// short fade envelope are applied. MediaPlayer remains at volume 1 so that
	// mute/volume changes do not stop or recreate the underlying iterator.
	const applyGainEnvelope = (
		gainNode: GainNode,
		entry: NormalizedAudioScheduleEntry,
		audioSyncAnchor: {readonly value: number},
		audioContext: AudioContext,
		audioContextCurrentTime = audioContext.currentTime,
	) => {
		scheduleAudioScheduleEntryGain({
			gainNode,
			entry,
			schedulerStartTimeInSeconds,
			audioSyncAnchor,
			audioContextCurrentTime,
		});
	};

	const applyGainEnvelopeAtAudioNodeStart = ({
		slot,
		scheduledTime,
		audioSyncAnchor,
		audioContext,
	}: {
		slot: PlayerSlot;
		scheduledTime: number;
		audioSyncAnchor: {readonly value: number};
		audioContext: AudioContext;
	}) => {
		// The source node is scheduled before this callback returns. Keep the
		// entry silent until that scheduled start, then use the normal short fade
		// from that point. This prevents exposing an arbitrary waveform sample
		// when a seek replaces an already-playing source.
		applyGainEnvelope(
			slot.gainNode,
			slot.entry,
			audioSyncAnchor,
			audioContext,
			Math.max(
				audioContext.currentTime,
				scheduledTime,
				(slot.seekGainMutedUntil ?? -Infinity) +
					AUDIO_SCHEDULER_GAIN_GUARD_SECONDS,
			),
		);
	};

	const isEntryActiveAtTime = (
		entry: NormalizedAudioScheduleEntry,
		globalCompositionTime: number,
	) => {
		const entryStart = getGlobalEntryOffsetSeconds(
			entry,
			schedulerStartTimeInSeconds,
		);
		return (
			globalCompositionTime >= entryStart &&
			globalCompositionTime < entryStart + entry.durationInSeconds
		);
	};

	// Create and dispose players from one controller. The full schedule remains
	// metadata; only entries in the rolling window get a MediaPlayer.
	useEffect(() => {
		if (!sharedAudioContext?.audioContext || !sharedAudioContext.gainNode) {
			return;
		}

		const {
			audioContext,
			gainNode: masterGainNode,
			audioSyncAnchor,
			scheduleAudioNode,
			unscheduleAudioNode,
		} = sharedAudioContext;
		const slots = new Map<string, PlayerSlot>();
		const retiredSlots = new Map<PlayerSlot, number>();
		const isDisposed = {value: false};
		slotsRef.current = slots;

		const disconnectRetiredSlots = () => {
			const now = audioContext.currentTime;
			for (const [slot, disconnectAt] of retiredSlots) {
				if (now < disconnectAt) {
					continue;
				}

				slot.gainNode.disconnect();
				retiredSlots.delete(slot);
			}
		};

		const disposeSlot = (slot: PlayerSlot, immediate = false) => {
			if (slot.disposed) {
				return;
			}

			slot.disposed = true;
			if (slots.get(slot.entry.id) === slot) {
				slots.delete(slot.entry.id);
			}

			const now = audioContext.currentTime;
			if (immediate) {
				slot.gainNode.gain.cancelScheduledValues(now);
				slot.gainNode.gain.setValueAtTime(0, now);
				slot.player.audioSyncAnchorChanged();
			} else {
				// A seek can evict a currently audible slot when it jumps outside the
				// rolling window. Do not cut its gain synchronously: that creates a click.
				// Stop queued source nodes at the same Web Audio-clock boundary so no old
				// audio can play after the fade completes.
				const fadeEndTime = now + AUDIO_SCHEDULER_SEEK_FADE_SECONDS;
				slot.gainNode.gain.cancelScheduledValues(now);
				slot.gainNode.gain.setValueAtTime(slot.gainNode.gain.value, now);
				slot.gainNode.gain.linearRampToValueAtTime(0, fadeEndTime);
				slot.seekGainMutedUntil = fadeEndTime;
				slot.waitingForFirstAudio = false;
				slot.player.audioSyncAnchorChanged(fadeEndTime);
				retiredSlots.set(slot, fadeEndTime);
			}

			slot.player.dispose().catch(() => {});
			if (immediate) {
				slot.gainNode.disconnect();
			}
		};

		const makePlayerForEntry = (
			entry: NormalizedAudioScheduleEntry,
			initialGlobalTime: number,
		): PlayerSlot => {
			const gainNode = audioContext.createGain();
			gainNode.gain.value = 0;
			gainNode.connect(masterGainNode);
			const entryIsActive = isEntryActiveAtTime(entry, initialGlobalTime);

			// Future entries can use their normal timeline envelope immediately. An
			// active entry must wait for its first real source node when the shared
			// context is kept alive, because decoding/scheduling is asynchronous.
			if (!holdGainUntilFirstAudio || !entryIsActive) {
				applyGainEnvelope(gainNode, entry, audioSyncAnchor, audioContext);
			}

			let slot: PlayerSlot | null = null;
			const scheduleAudioNodeForSlot = (
				options: ScheduleAudioNodeOptions,
			): ScheduleAudioNodeResult => {
				const result = scheduleAudioNode(options);
				if (
					result.type === 'started' &&
					result.startedImmediately !== false &&
					slot &&
					!slot.disposed &&
					slot.waitingForFirstAudio
				) {
					slot.waitingForFirstAudio = false;
					applyGainEnvelopeAtAudioNodeStart({
						slot,
						scheduledTime: result.scheduledTime,
						audioSyncAnchor,
						audioContext,
					});
				}

				return result;
			};

			const playerSharedAudioContext: SharedAudioContextForMediaPlayer = {
				audioContext,
				gainNode,
				audioSyncAnchor,
				scheduleAudioNode: scheduleAudioNodeForSlot,
				unscheduleAudioNode,
			};

			const player = new MediaPlayer({
				canvas: null,
				src: entry.previewSrc,
				logLevel,
				sharedAudioContext: playerSharedAudioContext,
				loop: false,
				trimBefore: entry.sourceStartTimeInSeconds * fps,
				trimAfter:
					(entry.sourceStartTimeInSeconds + entry.durationInSeconds) * fps,
				playbackRate: 1,
				toneFrequency: 1,
				globalPlaybackRate: 1,
				audioStreamIndex: null,
				fps,
				debugOverlay: false,
				bufferState: NO_OP_BUFFER_STATE,
				isPremounting: false,
				isPostmounting: false,
				durationInFrames: entry.durationInSeconds * fps,
				onVideoFrameCallback: null,
				playing: true,
				sequenceOffset: getGlobalEntryOffsetSeconds(
					entry,
					schedulerStartTimeInSeconds,
				),
				credentials: undefined,
				requestInit: undefined,
				tagType: 'audio',
				getEffects: () => [],
				getEffectChainState: () => null,
			});

			const initialLocalTime = getPlayerLocalTime({
				globalCompositionTime: initialGlobalTime,
				entry,
				schedulerStartTimeInSeconds,
				fps,
			});

			// The player receives time local to the schedule entry. Its
			// sequenceOffset maps that local time to the shared global clock.
			slot = {
				player,
				gainNode,
				entry,
				waitingForFirstAudio: holdGainUntilFirstAudio && entryIsActive,
				// initialize() already starts the iterator at this local time. Mark
				// it as requested so the current timeline pass does not immediately
				// issue a duplicate seek and restart the iterator.
				lastRequestedLocalTime: initialLocalTime,
				seekGainMutedUntil: null,
				disposed: false,
			};

			// Insert before starting initialization. This makes the entry visible to
			// any subsequent timeline pass immediately and prevents duplicate players
			// for the same schedule ID.
			slots.set(entry.id, slot);

			const handleInitializationFailure = (
				failure: {result: unknown} | {error: unknown},
			) => {
				// Initialization can fail after the slot was inserted into the map.
				// Remove only this exact slot: a later scheduling pass may already have
				// created a replacement for the same schedule ID.
				if (slots.get(entry.id) === slot) {
					disposeSlot(slot);
				}

				if ('result' in failure) {
					// eslint-disable-next-line no-console
					console.error(
						'[AudioScheduler] Audio entry initialization did not succeed',
						{
							entryId: entry.id,
							src: entry.previewSrc,
							initialLocalTime,
							result: failure.result,
						},
					);
				} else {
					// eslint-disable-next-line no-console
					console.error('[AudioScheduler] Failed to initialize audio entry', {
						entryId: entry.id,
						src: entry.previewSrc,
						initialLocalTime,
						error: failure.error,
					});
				}
			};

			player.initialize(initialLocalTime, false, 1).then((result) => {
				if (result.type !== 'success') {
					handleInitializationFailure({result});
				}
			}, (error) => {
				handleInitializationFailure({error});
			});

			return slot;
		};

		const syncToTime = (currentGlobalTime: number) => {
			if (isDisposed.value) {
				return;
			}
			disconnectRetiredSlots();

			const entriesInWindow = new Set<string>();
			for (const entry of schedule) {
				const entryStartTimeInSeconds = getGlobalEntryOffsetSeconds(
					entry,
					schedulerStartTimeInSeconds,
				);
				if (
					!isAudioSchedulerEntryInWindow({
						entryStartTimeInSeconds,
						entryDurationInSeconds: entry.durationInSeconds,
						currentTimeInSeconds: currentGlobalTime,
					})
				) {
					continue;
				}

				entriesInWindow.add(entry.id);
				if (!slots.has(entry.id)) {
					makePlayerForEntry(entry, currentGlobalTime);
				}
			}

			for (const slot of slots.values()) {
				if (!entriesInWindow.has(slot.entry.id)) {
					disposeSlot(slot);
				}
			}
		};

		const controller: AudioSchedulerController = {syncToTime};
		controllerRef.current = controller;
		syncToTime(schedulerStartTimeInSeconds + frameRef.current / fps);

		return () => {
			isDisposed.value = true;
			if (controllerRef.current === controller) {
				controllerRef.current = null;
			}

			for (const slot of slots.values()) {
				disposeSlot(slot, true);
			}
			for (const slot of retiredSlots.keys()) {
				slot.gainNode.disconnect();
			}
			retiredSlots.clear();

			slots.clear();
			if (slotsRef.current === slots) {
				slotsRef.current = new Map();
			}
		};

		// The values used to construct a MediaPlayer are intentionally captured
		// at mount. Changing them recreates all players, which is not a timeline
		// seek and can produce an audible discontinuity.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		fps,
		logLevel,
		schedule,
		schedulerStartTimeInSeconds,
		sharedAudioContext,
		holdGainUntilFirstAudio,
	]);

	// An anchor change invalidates every iterator's old scheduled source. Fade
	// the old source out on the Web Audio clock, schedule its stop at the end of
	// that fade, and make the replacement envelope start after the same boundary.
	// No wall-clock timer is involved in this transition.
	useLayoutEffect(() => {
		if (!sharedAudioContext?.audioContext) {
			return;
		}

		const {audioContext, audioSyncAnchor, audioSyncAnchorEmitter} =
			sharedAudioContext;
		const {remove} = audioSyncAnchorEmitter.subscribe((event) => {
			if (event !== 'changed') {
				return;
			}

			const currentGlobalTime =
				schedulerStartTimeInSeconds + frameRef.current / fps;
			controllerRef.current?.syncToTime(currentGlobalTime);

			for (const slot of slotsRef.current.values()) {
				const entryIsActive = isEntryActiveAtTime(
					slot.entry,
					currentGlobalTime,
				);
				slot.waitingForFirstAudio = holdGainUntilFirstAudio && entryIsActive;
				const now = audioContext.currentTime;
				const fadeEndTime = now + AUDIO_SCHEDULER_SEEK_FADE_SECONDS;
				slot.gainNode.gain.cancelScheduledValues(now);
				slot.gainNode.gain.setValueAtTime(slot.gainNode.gain.value, now);
				slot.gainNode.gain.linearRampToValueAtTime(0, fadeEndTime);
				slot.seekGainMutedUntil = fadeEndTime;
				slot.lastRequestedLocalTime = null;
				slot.player.audioSyncAnchorChanged(fadeEndTime);
				const localTime = getPlayerLocalTime({
					globalCompositionTime: currentGlobalTime,
					entry: slot.entry,
					schedulerStartTimeInSeconds,
					fps,
				});
				slot.lastRequestedLocalTime = localTime;
				slot.player.seekTo(localTime).catch(() => {});
				if (!slot.waitingForFirstAudio) {
					applyGainEnvelope(
						slot.gainNode,
						slot.entry,
						audioSyncAnchor,
						audioContext,
						Math.max(
							audioContext.currentTime,
							fadeEndTime + AUDIO_SCHEDULER_GAIN_GUARD_SECONDS,
						),
					);
				}
			}
		});

		return remove;
		// The mutable slot list is intentionally read from slotsRef. The effect
		// must not resubscribe on every timeline frame.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fps, schedulerStartTimeInSeconds, sharedAudioContext]);

	// Keep each player synchronized with the timeline. Seeking every changed
	// frame is also what lets MediaPlayer keep scheduling audio ahead during
	// ordinary playback.
	useLayoutEffect(() => {
		if (!sharedAudioContext?.audioContext) {
			return;
		}

		const currentGlobalTime = schedulerStartTimeInSeconds + frame / fps;
		controllerRef.current?.syncToTime(currentGlobalTime);

		for (const slot of slotsRef.current.values()) {
			const localTime = getPlayerLocalTime({
				globalCompositionTime: currentGlobalTime,
				entry: slot.entry,
				schedulerStartTimeInSeconds,
				fps,
			});
			if (slot.lastRequestedLocalTime === localTime) {
				continue;
			}

			slot.lastRequestedLocalTime = localTime;
			slot.player.seekTo(localTime).catch(() => {});
		}
	}, [fps, frame, schedulerStartTimeInSeconds, sharedAudioContext]);

	return null;
};

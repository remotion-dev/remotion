import type React from 'react';
import {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import {Internals, useCurrentFrame, useVideoConfig} from 'remotion';
import {MediaPlayer} from '../media-player';
import type {SharedAudioContextForMediaPlayer} from '../shared-audio-context-for-media-player';
import {scheduleAudioScheduleEntryGain} from './audio-scheduler-gain';
import {clampAudioSchedulerTime} from './audio-scheduler-timeline';
import type {NormalizedAudioScheduleEntry} from './audio-scheduler-types';

const {SharedAudioContext, SequenceContext} = Internals;

// AudioScheduler is managed outside Remotion's normal <Audio> buffering
// lifecycle. Its entries are mounted for the lifetime of the scheduler and
// are synchronized by the timeline and the shared audio anchor.
const NO_OP_BUFFER_STATE = {
	delayPlayback: () => ({unblock: () => {}}),
};

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
};

/**
 * Preview implementation of AudioScheduler.
 *
 * Every entry gets one MediaPlayer and one scheduler-owned GainNode. The
 * players are created once and remain mounted while the timeline moves across
 * entry boundaries. This is important: remounting a MediaPlayer at a cut
 * destroys its AudioBufferSourceNode and is an audible click.
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

	const slotsRef = useRef<PlayerSlot[]>([]);

	// The scheduler's outer gain is the only place where entry volume and the
	// short fade envelope are applied. MediaPlayer remains at volume 1 so that
	// mute/volume changes do not stop or recreate the underlying iterator.
	const applyGainEnvelope = (
		gainNode: GainNode,
		entry: NormalizedAudioScheduleEntry,
		audioSyncAnchor: {readonly value: number},
		audioContext: AudioContext,
	) => {
		scheduleAudioScheduleEntryGain({
			gainNode,
			entry,
			schedulerStartTimeInSeconds,
			audioSyncAnchor,
			audioContextCurrentTime: audioContext.currentTime,
		});
	};

	// Create and dispose all players in one effect. Keeping this as one effect
	// preserves the original scheduler's mount ordering and avoids a second
	// effect disposing players while their initialization is still in flight.
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

		const makePlayerForEntry = (
			entry: NormalizedAudioScheduleEntry,
			initialGlobalTime: number,
		): PlayerSlot => {
			const gainNode = audioContext.createGain();
			gainNode.gain.value = 0;
			gainNode.connect(masterGainNode);

			// Schedule the entry envelope before initializing MediaPlayer. This is
			// the same ordering used by the tested Content Studio scheduler.
			applyGainEnvelope(gainNode, entry, audioSyncAnchor, audioContext);

			const playerSharedAudioContext: SharedAudioContextForMediaPlayer = {
				audioContext,
				gainNode,
				audioSyncAnchor,
				scheduleAudioNode,
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
			player.initialize(initialLocalTime, false, 1).catch(() => {});

			return {player, gainNode, entry};
		};

		const currentGlobalTime =
			schedulerStartTimeInSeconds + frameRef.current / fps;
		const slots = schedule.map((entry) =>
			makePlayerForEntry(entry, currentGlobalTime),
		);
		slotsRef.current = slots;

		return () => {
			const slotsToDispose = slots;
			slotsRef.current = [];

			for (const slot of slotsToDispose) {
				const now = audioContext.currentTime;
				slot.gainNode.gain.cancelScheduledValues(now);
				slot.gainNode.gain.setValueAtTime(0, now);
				slot.player.dispose().catch(() => {});
				slot.gainNode.disconnect();
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
	]);

	// An anchor change invalidates every iterator's old scheduled source. The
	// order here is deliberate: silence -> destroy old iterator -> seek to the
	// current frame -> rebuild the gain envelope. This is the order from the
	// tested scheduler and prevents both stale audio and seek clicks.
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

			for (const slot of slotsRef.current) {
				const now = audioContext.currentTime;
				slot.gainNode.gain.cancelScheduledValues(now);
				slot.gainNode.gain.setValueAtTime(0, now);
				slot.player.audioSyncAnchorChanged();
				const localTime = getPlayerLocalTime({
					globalCompositionTime: currentGlobalTime,
					entry: slot.entry,
					schedulerStartTimeInSeconds,
					fps,
				});
				slot.player.seekTo(localTime).catch(() => {});
				applyGainEnvelope(
					slot.gainNode,
					slot.entry,
					audioSyncAnchor,
					audioContext,
				);
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
		for (const slot of slotsRef.current) {
			const localTime = getPlayerLocalTime({
				globalCompositionTime: currentGlobalTime,
				entry: slot.entry,
				schedulerStartTimeInSeconds,
				fps,
			});
			slot.player.seekTo(localTime).catch(() => {});
		}
	}, [fps, frame, schedulerStartTimeInSeconds, sharedAudioContext]);

	return null;
};

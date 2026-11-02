import type {CanvasContent} from 'remotion';
import {normalizeOutputPath} from './output-path';
import {
	getMediaDurationInFrames,
	type getMediaPreviewClock,
} from './use-media-metadata';

export type RenderOutputPlaybackClock = ReturnType<typeof getMediaPreviewClock>;

export type RenderOutputPlaybackContent = Extract<
	CanvasContent,
	{type: 'output' | 'output-blob'}
>;
export type RenderOutputPlaybackState = {
	frame: number;
	playbackStartFrame: number | null;
	fps: number;
	durationInFrames: number;
	playing: boolean;
	playbackRate: number;
	muted: boolean;
	volume: number;
	loop: boolean;
};
export type RenderOutputPlaybackTarget = {
	id: string;
	getState: () => RenderOutputPlaybackState;
	play: () => Promise<void>;
	pause: () => void;
	pauseAndReturnToPlayStart: () => void;
	seekToFrame: (frame: number) => void;
	setPlaybackRate: (rate: number) => void;
	setMuted: (muted: boolean) => void;
	setVolume: (volume: number) => void;
	setLoop: (loop: boolean) => void;
};
type Registration = {
	content: RenderOutputPlaybackContent;
	element: HTMLMediaElement;
	getClock: () => RenderOutputPlaybackClock | null;
	target: RenderOutputPlaybackTarget;
};
let current: Registration | null = null;

// Native media clocks can truncate a requested seek time to microseconds.
// Tolerate that precision loss without rounding ordinary mid-frame playback.
const mediaTimeToFrame = (time: number, fps: number) => {
	return Math.floor((time + 0.000001) * fps);
};

const isReady = (entry: Registration) => {
	const clock = entry.getClock();
	return (
		current === entry &&
		entry.element.isConnected &&
		entry.element.error === null &&
		entry.element.readyState >= 1 &&
		clock !== null &&
		entry.element.duration > 0 &&
		(Number.isFinite(entry.element.duration) ||
			typeof clock.videoTiming?.durationInFrames === 'number')
	);
};

export const getRenderOutputPlaybackTarget = (
	content: CanvasContent | null,
): RenderOutputPlaybackTarget | null => {
	if (!current || !content || !isReady(current)) return null;
	if (
		content.type === 'output' &&
		current.content.type === 'output' &&
		normalizeOutputPath(content.path) ===
			normalizeOutputPath(current.content.path)
	)
		return current.target;
	if (
		content.type === 'output-blob' &&
		current.content.type === 'output-blob' &&
		content.getBlob === current.content.getBlob &&
		content.displayName === current.content.displayName
	)
		return current.target;
	return null;
};

export const registerRenderOutputPlayback = ({
	content,
	element,
	getClock,
}: {
	content: RenderOutputPlaybackContent;
	element: HTMLMediaElement;
	getClock: () => RenderOutputPlaybackClock | null;
}) => {
	let playStartTime: number | null = null;
	let awaitingPlayEvent = false;
	let playRequest = 0;
	const onPlay = () => {
		if (current !== entry) return;
		if (!awaitingPlayEvent) playStartTime = element.currentTime;
		awaitingPlayEvent = false;
	};

	const requireCurrent = () => {
		if (!isReady(entry))
			throw new Error(
				'The rendered output preview changed or is not ready. Try again after it loads.',
			);
	};

	const target: RenderOutputPlaybackTarget = {
		id:
			content.type === 'output'
				? `output:${normalizeOutputPath(content.path)}`
				: `output-blob:${content.displayName}`,
		getState: () => {
			requireCurrent();
			const {fps, videoTiming} = getClock()!;
			const startTime = videoTiming?.startTime ?? 0;
			const durationInFrames =
				videoTiming?.durationInFrames ??
				getMediaDurationInFrames(element.duration, fps);
			return {
				frame: Math.min(
					durationInFrames - 1,
					Math.max(0, mediaTimeToFrame(element.currentTime - startTime, fps)),
				),
				playbackStartFrame:
					playStartTime === null
						? null
						: Math.min(
								durationInFrames - 1,
								Math.max(0, mediaTimeToFrame(playStartTime - startTime, fps)),
							),
				fps,
				durationInFrames,
				playing: !element.paused && !element.ended,
				playbackRate: element.playbackRate,
				muted: element.muted,
				volume: element.volume,
				loop: element.loop,
			};
		},
		play: async () => {
			requireCurrent();
			const request = ++playRequest;
			const previousPlayStartTime = playStartTime;
			if (element.paused || element.ended) {
				playStartTime = element.ended ? 0 : element.currentTime;
				awaitingPlayEvent = true;
			}

			try {
				await element.play();
			} catch (error) {
				if (request === playRequest && awaitingPlayEvent) {
					awaitingPlayEvent = false;
					playStartTime = previousPlayStartTime;
				}

				throw error;
			}

			if (!isReady(entry)) {
				if (current?.element !== element) element.pause();
				throw new Error(
					'The rendered output preview changed while playback was starting.',
				);
			}
		},
		pause: () => {
			requireCurrent();
			element.pause();
		},
		pauseAndReturnToPlayStart: () => {
			requireCurrent();
			if (playStartTime === null) return;
			element.pause();
			element.currentTime = Math.max(
				0,
				Math.min(element.duration, playStartTime),
			);
		},
		seekToFrame: (frame) => {
			const state = target.getState();
			if (
				!Number.isInteger(frame) ||
				frame < 0 ||
				frame >= state.durationInFrames
			)
				throw new Error(
					`Frame must be between 0 and ${state.durationInFrames - 1}.`,
				);
			const {videoTiming} = getClock()!;
			const time = (videoTiming?.startTime ?? 0) + frame / state.fps;
			if (videoTiming === null || time === 0) {
				element.currentTime = time;
				return;
			}

			// Media timestamps are quantized to track ticks and native seeks to microseconds.
			const ticks = time * videoTiming.timeResolution;
			const nextTick =
				Math.ceil(ticks - Number.EPSILON * ticks) / videoTiming.timeResolution;
			element.currentTime = Math.min(
				nextTick + 0.000002,
				time + 0.5 / state.fps,
			);
		},
		setPlaybackRate: (rate) => {
			requireCurrent();
			if (!Number.isFinite(rate) || rate <= 0)
				throw new Error(
					'Rendered output playback rate must be a positive number.',
				);
			element.playbackRate = rate;
		},
		setMuted: (muted) => {
			requireCurrent();
			element.muted = muted;
		},
		setVolume: (volume) => {
			requireCurrent();
			if (!Number.isFinite(volume) || volume < 0 || volume > 1)
				throw new Error('Volume must be between 0 and 1.');
			element.volume = volume;
		},
		setLoop: (loop) => {
			requireCurrent();
			element.loop = loop;
		},
	};
	const entry: Registration = {content, element, getClock, target};
	if (current && current.element !== element) current.element.pause();
	current = entry;
	element.addEventListener('play', onPlay);
	return () => {
		element.removeEventListener('play', onPlay);
		if (current === entry) {
			current = null;
			element.pause();
		} else if (current?.element !== element) element.pause();
	};
};

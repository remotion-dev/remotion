type SeekPayload = {
	frame: number;
};

type ErrorPayload = {
	error: Error;
};

type TimeUpdateEventPayload = {
	frame: number;
};

type FrameUpdateEventPayload = {
	frame: number;
};

type RateChangeEventPayload = {
	playbackRate: number;
};

type ScaleChangeEventPayload = {
	scale: number;
};

type VolumeChangeEventPayload = {
	volume: number;
};

type FullscreenChangeEventPayload = {
	isFullscreen: boolean;
};

type MuteChangeEventPayload = {
	isMuted: boolean;
};

type PlayerStateEventMap = {
	seeked: SeekPayload;
	pause: undefined;
	play: undefined;
	ratechange: RateChangeEventPayload;
	scalechange: ScaleChangeEventPayload;
	volumechange: VolumeChangeEventPayload;
	ended: undefined;
	error: ErrorPayload;
	timeupdate: TimeUpdateEventPayload;
	frameupdate: FrameUpdateEventPayload;
	fullscreenchange: FullscreenChangeEventPayload;
	mutechange: MuteChangeEventPayload;
};

type ThumbnailStateEventMap = {
	error: ErrorPayload;
};

export type PlayerEventTypes = keyof PlayerStateEventMap;
export type ThumbnailEventTypes = keyof ThumbnailStateEventMap;

export type CallbackListener<T extends PlayerEventTypes> = (data: {
	detail: PlayerStateEventMap[T];
}) => void;

type PlayerListeners = {
	[EventType in PlayerEventTypes]: CallbackListener<EventType>[];
};

type ThumbnailListeners = {
	[EventType in ThumbnailEventTypes]: CallbackListener<EventType>[];
};

export class PlayerEmitter {
	listeners: PlayerListeners = {
		ended: [],
		error: [],
		pause: [],
		play: [],
		ratechange: [],
		scalechange: [],
		seeked: [],
		timeupdate: [],
		frameupdate: [],
		fullscreenchange: [],
		volumechange: [],
		mutechange: [],
	};

	addEventListener<Q extends PlayerEventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		(this.listeners[name] as CallbackListener<Q>[]).push(callback);
	}

	removeEventListener<Q extends PlayerEventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		this.listeners[name] = this.listeners[name].filter(
			(l) => l !== callback
		) as PlayerListeners[Q];
	}

	private dispatchEvent<T extends PlayerEventTypes>(
		dispatchName: T,
		context: PlayerStateEventMap[T]
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			}
		);
	}

	dispatchSeek(frame: number) {
		this.dispatchEvent('seeked', {
			frame,
		});
	}

	dispatchVolumeChange(volume: number) {
		this.dispatchEvent('volumechange', {
			volume,
		});
	}

	dispatchPause() {
		this.dispatchEvent('pause', undefined);
	}

	dispatchPlay() {
		this.dispatchEvent('play', undefined);
	}

	dispatchEnded() {
		this.dispatchEvent('ended', undefined);
	}

	dispatchRateChange(playbackRate: number) {
		this.dispatchEvent('ratechange', {
			playbackRate,
		});
	}

	dispatchScaleChange(scale: number) {
		this.dispatchEvent('scalechange', {
			scale,
		});
	}

	dispatchError(error: Error) {
		this.dispatchEvent('error', {
			error,
		});
	}

	dispatchTimeUpdate(event: TimeUpdateEventPayload) {
		this.dispatchEvent('timeupdate', event);
	}

	dispatchFrameUpdate(event: FrameUpdateEventPayload) {
		this.dispatchEvent('frameupdate', event);
	}

	dispatchFullscreenChange(event: FullscreenChangeEventPayload) {
		this.dispatchEvent('fullscreenchange', event);
	}

	dispatchMuteChange(event: MuteChangeEventPayload) {
		this.dispatchEvent('mutechange', event);
	}
}

export class ThumbnailEmitter {
	listeners: ThumbnailListeners = {
		error: [],
	};

	addEventListener<Q extends ThumbnailEventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		(this.listeners[name] as CallbackListener<Q>[]).push(callback);
	}

	removeEventListener<Q extends ThumbnailEventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		this.listeners[name] = (
			this.listeners[name] as CallbackListener<ThumbnailEventTypes>[]
		).filter((l) => l !== callback);
	}

	private dispatchEvent<T extends ThumbnailEventTypes>(
		dispatchName: T,
		context: PlayerStateEventMap[T]
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			}
		);
	}

	dispatchError(error: Error) {
		this.dispatchEvent('error', {
			error,
		});
	}
}

type SeekPayload = {
	frame: number;
};

type ErrorPayload = {
	error: Error;
};

interface StateEventMap {
	seeked: CustomEvent<SeekPayload>;
	pause: CustomEvent<undefined>;
	play: CustomEvent<undefined>;
	ended: CustomEvent<undefined>;
	error: CustomEvent<ErrorPayload>;
}

export interface PlayerEventTarget extends EventTarget {
	addEventListener<K extends keyof StateEventMap>(
		type: K,
		listener: (ev: StateEventMap[K]) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

export const PlayerEventEmitter = EventTarget as {
	new (): PlayerEventTarget;
	prototype: PlayerEventTarget;
};

export class PlayerEmitter extends PlayerEventEmitter {
	dispatchSeek(frame: number) {
		this.dispatchEvent(
			new CustomEvent<SeekPayload>('seeked', {
				detail: {
					frame,
				},
			})
		);
	}

	dispatchPause() {
		this.dispatchEvent(new CustomEvent('pause'));
	}

	dispatchPlay() {
		this.dispatchEvent(new CustomEvent('play'));
	}

	dispatchEnded() {
		this.dispatchEvent(new CustomEvent('ended'));
	}

	dispatchError(error: Error) {
		this.dispatchEvent(
			new CustomEvent<ErrorPayload>('error', {
				detail: {
					error,
				},
			})
		);
	}
}

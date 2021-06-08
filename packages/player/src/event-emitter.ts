type SeekPayload = {
	frame: number;
};

type ErrorPayload = {
	error: Error;
};

type StateEventMap = {
	seeked: SeekPayload;
	pause: undefined;
	play: undefined;
	ended: undefined;
	error: ErrorPayload;
};

type EventTypes = keyof StateEventMap;

type CallbackListener<T extends EventTypes> = (data: {
	detail: StateEventMap[T];
}) => void;

type Listeners = {[EventType in EventTypes]: CallbackListener<EventType>[]};

export class PlayerEmitter {
	listeners: Listeners = {
		ended: [],
		error: [],
		pause: [],
		play: [],
		seeked: [],
	};

	addEventListener<Q extends EventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		(this.listeners[name] as CallbackListener<Q>[]).push(callback);
	}

	removeEventListener<Q extends EventTypes>(
		name: Q,
		callback: CallbackListener<Q>
	) {
		this.listeners[name] = (this.listeners[
			name
		] as CallbackListener<EventTypes>[]).filter((l) => l !== callback);
	}

	private dispatchEvent<T extends EventTypes>(
		dispatchName: T,
		context: StateEventMap[T]
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

	dispatchPause() {
		this.dispatchEvent('pause', undefined);
	}

	dispatchPlay() {
		this.dispatchEvent('play', undefined);
	}

	dispatchEnded() {
		this.dispatchEvent('ended', undefined);
	}

	dispatchError(error: Error) {
		this.dispatchEvent('error', {
			error,
		});
	}
}

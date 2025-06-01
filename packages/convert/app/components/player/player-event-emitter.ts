type TimeUpdateEventPayload = {
	time: number;
};

type PlayerEventMap = {
	pause: undefined;
	play: undefined;
	timeupdate: TimeUpdateEventPayload;
};

export type PlayerEventTypes = keyof PlayerEventMap;

export type CallbackListener<T extends PlayerEventTypes> = (data: {
	detail: PlayerEventMap[T];
}) => void;

type PlayerListeners = {
	[EventType in PlayerEventTypes]: CallbackListener<EventType>[];
};

export class PlayerEmitter {
	listeners: PlayerListeners = {
		pause: [],
		play: [],
		timeupdate: [],
	};

	addEventListener = <Q extends keyof PlayerEventMap>(
		name: Q,
		callback: CallbackListener<Q>,
	) => {
		this.listeners[name].push(callback);
	};

	removeEventListener = <Q extends keyof PlayerEventMap>(
		name: Q,
		callback: CallbackListener<Q>,
	) => {
		this.listeners[name] = this.listeners[name].filter(
			(l) => l !== callback,
		) as PlayerListeners[Q];
	};

	private dispatchEvent<T extends PlayerEventTypes>(
		dispatchName: T,
		context: PlayerEventMap[T],
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			},
		);
	}

	dispatchPause = () => {
		this.dispatchEvent('pause', undefined);
	};

	dispatchPlay = () => {
		this.dispatchEvent('play', undefined);
	};

	dispatchTimeUpdate = (time: number) => {
		this.dispatchEvent('timeupdate', {time});
	};
}

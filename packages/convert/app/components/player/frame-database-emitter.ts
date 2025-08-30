type FrameDatabaseEventMap = {
	queuechanged: undefined;
};

export type FrameDatabaseEventTypes = keyof FrameDatabaseEventMap;

export type CallbackListener<T extends FrameDatabaseEventTypes> = (data: {
	detail: FrameDatabaseEventMap[T];
}) => void;

type FrameDatabaseListeners = {
	[EventType in FrameDatabaseEventTypes]: CallbackListener<EventType>[];
};

export class FrameDatabaseEmitter {
	listeners: FrameDatabaseListeners = {
		queuechanged: [],
	};

	addEventListener = <Q extends keyof FrameDatabaseEventMap>(
		name: Q,
		callback: CallbackListener<Q>,
	) => {
		this.listeners[name].push(callback);
	};

	removeEventListener = <Q extends keyof FrameDatabaseEventMap>(
		name: Q,
		callback: CallbackListener<Q>,
	) => {
		this.listeners[name] = this.listeners[name].filter(
			(l) => l !== callback,
		) as FrameDatabaseListeners[Q];
	};

	private dispatchEvent<T extends FrameDatabaseEventTypes>(
		dispatchName: T,
		context: FrameDatabaseEventMap[T],
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			},
		);
	}

	dispatchQueueChanged = () => {
		this.dispatchEvent('queuechanged', undefined);
	};
}

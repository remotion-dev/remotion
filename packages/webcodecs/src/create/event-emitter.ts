type Input = {
	timestamp: number;
	keyFrame: boolean;
};

type Output = {
	timestamp: number;
};

type Processed = {};

type Progress = {
	smallestProgress: number;
};

type IoEventMap = {
	input: Input;
	output: Output;
	processed: Processed;
	progress: Progress;
};

export type IoEventTypes = keyof IoEventMap;

export type CallbackListener<T extends IoEventTypes> = (data: {
	detail: IoEventMap[T];
}) => void;

type IoListeners = {
	[EventType in IoEventTypes]: CallbackListener<EventType>[];
};

export class IoEventEmitter {
	listeners: IoListeners = {
		input: [],
		output: [],
		processed: [],
		progress: [],
	};

	addEventListener<Q extends IoEventTypes>(
		name: Q,
		callback: CallbackListener<Q>,
	) {
		(this.listeners[name] as CallbackListener<Q>[]).push(callback);
	}

	removeEventListener<Q extends IoEventTypes>(
		name: Q,
		callback: CallbackListener<Q>,
	) {
		this.listeners[name] = this.listeners[name].filter(
			(l) => l !== callback,
		) as IoListeners[Q];
	}

	dispatchEvent<T extends IoEventTypes>(
		dispatchName: T,
		context: IoEventMap[T],
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			},
		);
	}
}

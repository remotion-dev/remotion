import {withResolvers} from '../with-resolvers';

type MediaParserEventMap = {
	pause: undefined;
	resume: undefined;
	abort: {reason?: unknown};
	seek: {seek: number};
};

export type MediaParserEventTypes = keyof MediaParserEventMap;

export type CallbackListener<T extends MediaParserEventTypes> = (data: {
	detail: MediaParserEventMap[T];
}) => void;

type MediaParserListeners = {
	[EventType in MediaParserEventTypes]: CallbackListener<EventType>[];
};

export class MediaParserEmitter {
	listeners: MediaParserListeners = {
		pause: [],
		resume: [],
		abort: [],
		seek: [],
	};

	readyPromise: Promise<void>;
	#markAsReady: () => void;

	constructor() {
		const {promise, resolve} = withResolvers<void>();
		this.readyPromise = promise;
		this.#markAsReady = resolve;
	}

	markAsReady = () => {
		this.#markAsReady();
	};

	addEventListener = <Q extends MediaParserEventTypes>(
		name: Q,
		callback: CallbackListener<Q>,
	) => {
		(this.listeners[name] as CallbackListener<Q>[]).push(callback);
	};

	removeEventListener = <Q extends MediaParserEventTypes>(
		name: Q,
		callback: CallbackListener<Q>,
	) => {
		this.listeners[name] = this.listeners[name].filter(
			(l) => l !== callback,
		) as MediaParserListeners[Q];
	};

	private dispatchEvent<T extends MediaParserEventTypes>(
		dispatchName: T,
		context: MediaParserEventMap[T],
	) {
		(this.listeners[dispatchName] as CallbackListener<T>[]).forEach(
			(callback) => {
				callback({detail: context});
			},
		);
	}

	dispatchPause = () => {
		this.readyPromise = this.readyPromise.then(() => {
			this.dispatchEvent('pause', undefined);
		});
	};

	dispatchResume = () => {
		this.readyPromise = this.readyPromise.then(() => {
			this.dispatchEvent('resume', undefined);
		});
	};

	dispatchAbort = (reason?: unknown) => {
		this.readyPromise = this.readyPromise.then(() => {
			this.dispatchEvent('abort', {reason});
		});
	};

	dispatchSeek = (seek: number) => {
		this.readyPromise = this.readyPromise.then(() => {
			this.dispatchEvent('seek', {seek});
		});
	};
}

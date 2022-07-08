import type {Emitter, EventType, Handler} from './mitt';
import mitt from './mitt';

export interface CommonEventEmitter {
	on(event: EventType, handler: Handler): CommonEventEmitter;
	off(event: EventType, handler: Handler): CommonEventEmitter;
	addListener(event: EventType, handler: Handler): CommonEventEmitter;
	emit(event: EventType, eventData?: unknown): boolean;
	once(event: EventType, handler: Handler): CommonEventEmitter;
	listenerCount(event: string): number;
	removeAllListeners(event?: EventType): CommonEventEmitter;
}

export class EventEmitter implements CommonEventEmitter {
	private emitter: Emitter;
	private eventsMap = new Map<EventType, Handler[]>();

	constructor() {
		this.emitter = mitt(this.eventsMap);
	}

	on(event: EventType, handler: Handler): EventEmitter {
		this.emitter.on(event, handler);
		return this;
	}

	off(event: EventType, handler: Handler): EventEmitter {
		this.emitter.off(event, handler);
		return this;
	}

	addListener(event: EventType, handler: Handler): EventEmitter {
		this.on(event, handler);
		return this;
	}

	emit(event: EventType, eventData?: unknown): boolean {
		this.emitter.emit(event, eventData);
		return this.eventListenersCount(event) > 0;
	}

	once(event: EventType, handler: Handler): EventEmitter {
		const onceHandler: Handler = (eventData) => {
			handler(eventData);
			this.off(event, onceHandler);
		};

		return this.on(event, onceHandler);
	}

	listenerCount(event: EventType): number {
		return this.eventListenersCount(event);
	}

	removeAllListeners(event?: EventType): EventEmitter {
		if (event) {
			this.eventsMap.delete(event);
		} else {
			this.eventsMap.clear();
		}

		return this;
	}

	private eventListenersCount(event: EventType): number {
		return this.eventsMap.get(event)?.length || 0;
	}
}

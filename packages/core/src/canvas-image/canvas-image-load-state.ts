export type LoadedImage = {
	readonly element: HTMLImageElement;
	readonly width: number;
	readonly height: number;
};

export type CanvasImageLoadState =
	| {readonly type: 'idle'}
	| {readonly type: 'loading'}
	| {readonly type: 'applying-effects'; readonly image: LoadedImage}
	| {readonly type: 'ready'; readonly image: LoadedImage}
	| {readonly type: 'load-failed'};

export type CanvasImageLoadEvent =
	| {readonly type: 'load-started'}
	| {readonly type: 'image-decoded'; readonly image: LoadedImage}
	| {readonly type: 'presented'}
	| {readonly type: 'load-failed'};

export const canvasImageLoadReducer = (
	state: CanvasImageLoadState,
	event: CanvasImageLoadEvent,
): CanvasImageLoadState => {
	switch (event.type) {
		case 'load-started':
			return state.type === 'loading' ? state : {type: 'loading'};
		case 'image-decoded':
			return {type: 'applying-effects', image: event.image};
		case 'presented':
			return state.type === 'applying-effects'
				? {type: 'ready', image: state.image}
				: state;
		case 'load-failed':
			return state.type === 'loading' ? {type: 'load-failed'} : state;
		default:
			throw new Error('Unknown event ' + JSON.stringify(event satisfies never));
	}
};

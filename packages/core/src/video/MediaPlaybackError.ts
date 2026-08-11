export class MediaPlaybackError extends Error {
	readonly src: string;

	constructor({message, src}: {message: string; src: string}) {
		super(message);
		this.name = 'MediaPlaybackError';
		this.src = src;
	}
}

export class VideoUndecodableError extends Error {
	public config: VideoDecoderConfig;

	constructor({
		message,
		config,
	}: {
		message: string;
		config: VideoDecoderConfig;
	}) {
		super(message);
		this.name = 'VideoUndecodableError';
		this.config = config;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, VideoUndecodableError);
		}
	}
}

export class AudioUndecodableError extends Error {
	public config: AudioDecoderConfig;

	constructor({
		message,
		config,
	}: {
		message: string;
		config: AudioDecoderConfig;
	}) {
		super(message);
		this.name = 'AudioUndecodableError';
		this.config = config;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AudioUndecodableError);
		}
	}
}

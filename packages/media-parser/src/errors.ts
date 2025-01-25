export class IsAGifError extends Error {
	public mimeType: string | null;
	public sizeInBytes: number | null;
	public fileName: string | null;

	constructor({
		message,
		mimeType,
		sizeInBytes,
		fileName,
	}: {
		message: string;
		mimeType: string | null;
		sizeInBytes: number | null;
		fileName: string | null;
	}) {
		super(message);
		this.fileName = 'IsAGifError';
		this.mimeType = mimeType;
		this.sizeInBytes = sizeInBytes;
		this.fileName = fileName;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAGifError);
		}
	}
}

type ImageType = 'png' | 'jpeg' | 'bmp' | 'webp';
type Dimensions = {width: number; height: number};

export class IsAnImageError extends Error {
	public imageType: ImageType;
	public dimensions: Dimensions | null;
	public mimeType: string | null;
	public sizeInBytes: number | null;
	public fileName: string | null;

	constructor({
		dimensions,
		imageType,
		message,
		mimeType,
		sizeInBytes,
		fileName,
	}: {
		message: string;
		imageType: ImageType;
		dimensions: Dimensions | null;
		mimeType: string | null;
		sizeInBytes: number | null;
		fileName: string | null;
	}) {
		super(message);
		this.name = 'IsAnImageError';
		this.imageType = imageType;
		this.dimensions = dimensions;
		this.mimeType = mimeType;
		this.sizeInBytes = sizeInBytes;
		this.fileName = fileName;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAnImageError);
		}
	}
}

export class IsAPdfError extends Error {
	public mimeType: string | null;
	public sizeInBytes: number | null;
	public fileName: string | null;

	constructor({
		message,
		mimeType,
		sizeInBytes,
		fileName,
	}: {
		message: string;
		mimeType: string | null;
		sizeInBytes: number | null;
		fileName: string | null;
	}) {
		super(message);
		this.name = 'IsAPdfError';
		this.mimeType = mimeType;
		this.sizeInBytes = sizeInBytes;
		this.fileName = fileName;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAPdfError);
		}
	}
}

export class IsAnUnsupportedFileTypeError extends Error {
	public mimeType: string | null;
	public sizeInBytes: number | null;
	public fileName: string | null;

	constructor({
		message,
		mimeType,
		sizeInBytes,
		fileName,
	}: {
		message: string;
		mimeType: string | null;
		sizeInBytes: number | null;
		fileName: string | null;
	}) {
		super(message);
		this.name = 'IsAnUnsupportedFileTypeError';
		this.mimeType = mimeType;
		this.sizeInBytes = sizeInBytes;
		this.fileName = fileName;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAnUnsupportedFileTypeError);
		}
	}
}

type UnsupportedAudioType = never;

export class IsAnUnsupportedAudioTypeError extends Error {
	public mimeType: string | null;
	public sizeInBytes: number | null;
	public fileName: string | null;
	public audioType: UnsupportedAudioType | null;

	constructor({
		message,
		mimeType,
		sizeInBytes,
		fileName,
		audioType,
	}: {
		message: string;
		mimeType: string | null;
		sizeInBytes: number | null;
		fileName: string | null;
		audioType: UnsupportedAudioType | null;
	}) {
		super(message);
		this.name = 'IsAnUnsupportedAudioTypeError';
		this.mimeType = mimeType;
		this.sizeInBytes = sizeInBytes;
		this.fileName = fileName;
		this.audioType = audioType;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAnUnsupportedAudioTypeError);
		}
	}
}

export class MediaParserAbortError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MediaParserAbortError';
		this.cause = undefined;
	}
}

export const hasBeenAborted = (
	error: unknown,
): error is MediaParserAbortError => {
	return error instanceof MediaParserAbortError;
};

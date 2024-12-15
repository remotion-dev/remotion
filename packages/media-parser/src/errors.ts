export class IsAGifError extends Error {
	public mimeType: string | null;
	public sizeInBytes: number | null;

	constructor({
		message,
		mimeType,
		sizeInBytes,
	}: {
		message: string;
		mimeType: string | null;
		sizeInBytes: number | null;
	}) {
		super(message);
		this.name = 'IsAGifError';
		this.mimeType = mimeType;
		this.sizeInBytes = sizeInBytes;

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

	constructor({
		dimensions,
		imageType,
		message,
		mimeType,
		sizeInBytes,
	}: {
		message: string;
		imageType: ImageType;
		dimensions: Dimensions | null;
		mimeType: string | null;
		sizeInBytes: number | null;
	}) {
		super(message);
		this.name = 'IsAnImageError';
		this.imageType = imageType;
		this.dimensions = dimensions;
		this.mimeType = mimeType;
		this.sizeInBytes = sizeInBytes;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAnImageError);
		}
	}
}

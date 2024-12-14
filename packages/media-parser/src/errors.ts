export class IsAGifError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'IsAGifError';

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAGifError);
		}
	}
}

type ImageType = 'png' | 'jpeg' | 'bmp';

export class IsAnImageError extends Error {
	public imageType: ImageType;

	constructor(message: string, imageType: ImageType) {
		super(message);
		this.name = 'IsAnImageError';
		this.imageType = imageType;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAnImageError);
		}
	}
}

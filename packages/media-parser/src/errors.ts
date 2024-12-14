export class IsAGifError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'IsAGifError';

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

	constructor(
		message: string,
		imageType: ImageType,
		dimensions: Dimensions | null,
	) {
		super(message);
		this.name = 'IsAnImageError';
		this.imageType = imageType;
		this.dimensions = dimensions;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, IsAnImageError);
		}
	}
}

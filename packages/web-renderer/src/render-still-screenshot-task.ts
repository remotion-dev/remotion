import type {InternalState} from './internal-state';

export type RenderStillOnWebImageFormat = 'png' | 'jpeg' | 'webp';

export type RenderStillOnWebEncodeOptions = {
	format?: RenderStillOnWebImageFormat;
	/**
	 * Encoder quality for `jpeg` and `webp`, between `0` and `1`.
	 * Ignored for `png`.
	 */
	quality?: number;
};

/**
 * Outcome of `renderStillOnWeb()`. The frame is already rendered; use
 * `canvas()`, `blob()`, or `url()` to read pixels or encode (same pattern as
 * Renoun’s `screenshot()` task).
 */
export type RenderStillOnWebResult = {
	internalState: InternalState;
	canvas(): Promise<OffscreenCanvas>;
	blob(options?: RenderStillOnWebEncodeOptions): Promise<Blob>;
	/**
	 * Creates an object URL from an encoded blob. Call `URL.revokeObjectURL()` when done.
	 */
	url(options?: RenderStillOnWebEncodeOptions): Promise<string>;
};

const mimeTypeForFormat = (format: RenderStillOnWebImageFormat): string => {
	if (format === 'jpeg') {
		return 'image/jpeg';
	}

	if (format === 'webp') {
		return 'image/webp';
	}

	return 'image/png';
};

const encodeCanvasToBlob = async (
	canvas: OffscreenCanvas,
	options?: RenderStillOnWebEncodeOptions,
): Promise<Blob> => {
	const format = options?.format ?? 'png';
	const type = mimeTypeForFormat(format);
	if (format === 'png') {
		return canvas.convertToBlob({type});
	}

	return canvas.convertToBlob({
		type,
		quality: options?.quality,
	});
};

export const createRenderStillOnWebResult = ({
	canvas,
	internalState,
}: {
	canvas: OffscreenCanvas;
	internalState: InternalState;
}): RenderStillOnWebResult => {
	return {
		internalState,
		canvas: () => Promise.resolve(canvas),
		blob: (options?: RenderStillOnWebEncodeOptions) =>
			encodeCanvasToBlob(canvas, options),
		url: async (options?: RenderStillOnWebEncodeOptions) => {
			const blob = await encodeCanvasToBlob(canvas, options);
			return URL.createObjectURL(blob);
		},
	};
};

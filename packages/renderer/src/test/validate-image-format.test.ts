import {expect, test} from 'bun:test';
import {validateStillImageFormat} from '../image-format';

test('"none" is not a valid image format', () => {
	expect(() => validateStillImageFormat('jpeg')).not.toThrow();
	expect(() => validateStillImageFormat('png')).not.toThrow();
	expect(() => validateStillImageFormat('pdf')).not.toThrow();
	// @ts-expect-error
	expect(() => validateStillImageFormat('none')).toThrow(
		/Image format should be one of: "png", "jpeg", "pdf", "webp"/,
	);
});

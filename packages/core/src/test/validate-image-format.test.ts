import {expect, test} from 'vitest';
import {validateNonNullImageFormat} from '../validation/validate-image-format';

test('"none" is not a valid image format', () => {
	expect(() => validateNonNullImageFormat('jpeg')).not.toThrow();
	expect(() => validateNonNullImageFormat('png')).not.toThrow();
	expect(() => validateNonNullImageFormat('none')).toThrow(
		/Image format should be either "png" or "jpeg"/
	);
});

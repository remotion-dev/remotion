import {validateImageFormat} from '../validation/validate-image-format';

test('"none" is not a valid image format', () => {
	expect(() => validateImageFormat('jpeg')).not.toThrow();
	expect(() => validateImageFormat('png')).not.toThrow();
	expect(() => validateImageFormat('none')).toThrow(
		/Image format should be either "png" or "jpeg"/
	);
});

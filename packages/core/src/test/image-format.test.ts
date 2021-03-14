import {
	setImageFormat,
	validateSelectedPixelFormatAndImageFormatCombination,
} from '../config/image-format';
import {expectToThrow} from './expect-to-throw';

test('It should throw if image format is not valid', () => {
	expectToThrow(
		() =>
			setImageFormat(
				// @ts-expect-error
				'invalidImageFormat'
			),
		/Value invalidImageFormat is not valid as an image format./
	);
});
test('It should throw if image format is not valid', () => {
	expectToThrow(
		() =>
			validateSelectedPixelFormatAndImageFormatCombination(
				'yuv420p',
				// @ts-expect-error
				'invalidImageFormat'
			),
		/Value invalidImageFormat is not valid as an image format./
	);
});
test('It should throw if pixel and image format combination is not valid', () => {
	expectToThrow(
		() =>
			validateSelectedPixelFormatAndImageFormatCombination('yuva420p', 'jpeg'),
		/Pixel format was set to 'yuva420p' but the image format is not PNG. To render transparent videos, you need to set PNG as the image format./
	);
});
test('It should not throw if pixel and image format combination is valid', () => {
	expect(() =>
		validateSelectedPixelFormatAndImageFormatCombination('yuva420p', 'png')
	).not.toThrow();
});
test('It should not throw if pixel and image format combination is valid', () => {
	expect(() =>
		validateSelectedPixelFormatAndImageFormatCombination('yuv420p', 'png')
	).not.toThrow();
});
test('It should not throw if pixel and image format combination is valid', () => {
	expect(() =>
		validateSelectedPixelFormatAndImageFormatCombination('yuv420p', 'jpeg')
	).not.toThrow();
});

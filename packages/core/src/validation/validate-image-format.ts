import {ImageFormat} from '../config';

export const validateImageFormat = (imageFormat: ImageFormat) => {
	if (imageFormat !== 'jpeg' && imageFormat !== 'png') {
		throw new TypeError('Image format should be either "png" or "jpeg"');
	}
};

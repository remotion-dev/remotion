export const getBrightnessOfFrame = async (frame: VideoFrame) => {
	const bitmap = await createImageBitmap(frame);
	const canvas = document.createElement('canvas');
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	const context = canvas.getContext('2d');
	if (context === null) {
		throw new Error('Could not get 2d context');
	}

	context.drawImage(bitmap, 0, 0);
	const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	let sum = 0;
	for (let i = 0; i < imageData.data.length; i += 4) {
		sum +=
			imageData.data[i] * 0.299 +
			imageData.data[i + 1] * 0.587 +
			imageData.data[i + 2] * 0.114;
	}

	return sum / (imageData.data.length / 4) / 255;
};

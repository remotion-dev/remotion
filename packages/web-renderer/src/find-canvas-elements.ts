export const findCanvasElements = (element: HTMLDivElement) => {
	const canvasElements = element.querySelectorAll('canvas');

	Array.from(canvasElements).forEach((canvasElement) => {
		const canvas = canvasElement as HTMLCanvasElement;
		const canvasContext = canvas.getContext('2d');
		if (canvasContext) {
			const imageData = canvasContext.getImageData(
				0,
				0,
				canvas.width,
				canvas.height,
			);
			console.log(imageData);
		}
	});
};

export type ParseMediaEmbeddedImage = {
	description: string | null;
	mimeType: string | null;
	data: Uint8Array;
};

export const imagesState = () => {
	const images: ParseMediaEmbeddedImage[] = [];

	const addImage = (image: ParseMediaEmbeddedImage) => {
		images.push(image);
	};

	return {
		images,
		addImage,
	};
};

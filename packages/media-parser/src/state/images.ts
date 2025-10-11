export type MediaParserEmbeddedImage = {
	description: string | null;
	mimeType: string | null;
	data: Uint8Array;
};

export const imagesState = () => {
	const images: MediaParserEmbeddedImage[] = [];

	const addImage = (image: MediaParserEmbeddedImage) => {
		images.push(image);
	};

	return {
		images,
		addImage,
	};
};

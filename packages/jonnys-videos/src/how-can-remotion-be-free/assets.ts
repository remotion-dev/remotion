const ASSET_BASE_URL =
	'https://remotion.media/jonnys-videos/how-can-remotion-be-free/';

export const asset = (filename: string) => {
	return `${ASSET_BASE_URL}${encodeURIComponent(filename)}`;
};

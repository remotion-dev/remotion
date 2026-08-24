const ASSET_BASE_URL = 'https://remotion.media/disco-light-show/';

export const asset = (filename: string) => {
	return `${ASSET_BASE_URL}${encodeURIComponent(filename)}`;
};

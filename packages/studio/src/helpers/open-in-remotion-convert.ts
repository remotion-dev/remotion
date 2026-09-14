import {staticFile} from 'remotion';

export const getRemotionConvertUrl = ({
	relativePath,
	studioOrigin,
}: {
	relativePath: string;
	studioOrigin: string;
}) => {
	const convertUrl = new URL('https://www.remotion.dev/convert');
	const assetUrl = new URL(staticFile(relativePath), studioOrigin);
	convertUrl.searchParams.set('url', assetUrl.toString());
	return convertUrl.toString();
};

export const openInRemotionConvert = ({
	relativePath,
}: {
	relativePath: string;
}) => {
	window.open(
		getRemotionConvertUrl({
			relativePath,
			studioOrigin: window.location.origin,
		}),
		'_blank',
		'noopener,noreferrer',
	);
};

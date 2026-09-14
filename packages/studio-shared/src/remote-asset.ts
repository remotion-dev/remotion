import type {InsertableCompositionElement} from './api-requests';
import type {ImageFileType} from './detect-file-type';

export const maxRemoteAssetSize = 50 * 1024 * 1024;
export const remoteAssetDownloadTimeout = 15_000;
export const remoteAssetAcceptHeader =
	'image/png,image/apng,image/jpeg,image/webp,image/bmp,image/gif';

const extensionsForFileType: Record<ImageFileType['type'], string[]> = {
	png: ['png'],
	apng: ['png', 'apng'],
	jpeg: ['jpg', 'jpeg'],
	webp: ['webp'],
	bmp: ['bmp'],
	gif: ['gif'],
};

export const getRemoteAssetFilename = ({
	fileType,
	url,
}: {
	fileType: ImageFileType;
	url: URL;
}) => {
	const encodedBasename = url.pathname.slice(url.pathname.lastIndexOf('/') + 1);
	let basename: string;
	try {
		basename = decodeURIComponent(encodedBasename);
	} catch {
		basename = encodedBasename;
	}

	const sanitized = Array.from(basename)
		.map((character) => {
			const charCode = character.charCodeAt(0);
			return charCode <= 31 || '<>:"/\\|?*'.includes(character)
				? '-'
				: character;
		})
		.join('')
		.trim()
		.replace(/^[. ]+|[. ]+$/g, '');
	const filenameWithoutFallback = sanitized === '' ? 'image' : sanitized;
	const extensions = extensionsForFileType[fileType.type];
	const lastDot = filenameWithoutFallback.lastIndexOf('.');
	const extension =
		lastDot > 0 ? filenameWithoutFallback.slice(lastDot + 1).toLowerCase() : '';

	if (extensions.includes(extension)) {
		return filenameWithoutFallback;
	}

	const withoutExtension = extension
		? filenameWithoutFallback.slice(0, -(extension.length + 1))
		: filenameWithoutFallback;
	const safeName = withoutExtension === '' ? 'image' : withoutExtension;
	return `${safeName}.${extensions[0]}`;
};

export const getRemoteAssetElement = ({
	assetPath,
	fileType,
}: {
	assetPath: string;
	fileType: ImageFileType;
}): InsertableCompositionElement => ({
	type: 'asset',
	assetType:
		fileType.type === 'gif'
			? 'gif'
			: fileType.type === 'apng' ||
				  (fileType.type === 'webp' && fileType.animated)
				? 'animated-image'
				: 'image',
	src: assetPath,
	srcType: 'static',
	dimensions: fileType.dimensions,
	durationInFrames: null,
	position: null,
});

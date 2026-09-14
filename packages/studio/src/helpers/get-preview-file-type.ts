export type AssetFileType =
	| 'audio'
	| 'font'
	| 'video'
	| 'image'
	| 'json'
	| 'txt'
	| 'other';

export const getPreviewFileType = (fileName: string | null): AssetFileType => {
	if (!fileName) {
		return 'other';
	}

	const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'];
	const videoExtensions = [
		'mp4',
		'avi',
		'mkv',
		'mov',
		'webm',
		'm4v',
		'ts',
		'm2ts',
		'm3u8',
	];
	const imageExtensions = [
		'jpg',
		'jpeg',
		'png',
		'apng',
		'gif',
		'bmp',
		'webp',
		'svg',
	];
	const fontExtensions = ['woff', 'woff2', 'ttf', 'otf', 'eot'];

	const fileExtension = fileName.split('.').pop()?.toLowerCase();
	if (fileExtension === undefined) {
		throw new Error('File extension is undefined');
	}

	if (audioExtensions.includes(fileExtension)) {
		return 'audio';
	}

	if (videoExtensions.includes(fileExtension)) {
		return 'video';
	}

	if (imageExtensions.includes(fileExtension)) {
		return 'image';
	}

	if (fontExtensions.includes(fileExtension)) {
		return 'font';
	}

	if (fileExtension === 'json') {
		return 'json';
	}

	if (fileExtension === 'txt') {
		return 'txt';
	}

	return 'other';
};

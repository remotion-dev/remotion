import execa from 'execa';

export const guessExtensionForVideo = async (src: string) => {
	const {stderr} = await execa('ffprobe', [src]);

	if (stderr.includes('h264')) {
		return 'mp4';
	}

	if (stderr.includes('mp3,')) {
		return 'mp3';
	}

	if (stderr.includes('Video: vp9')) {
		return 'webm';
	}

	if (stderr.includes('Video: vp8')) {
		return 'webm';
	}

	if (stderr.includes('wav, ')) {
		return 'wav';
	}

	throw new Error(
		`A media file ${src} which has no file extension and whose format could not be guessed. Is this a valid media file?`
	);
};

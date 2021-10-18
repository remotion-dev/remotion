// For the h264-mkv format, we need to convert an MP3 file to PCM first

import path from 'path';
import execa from 'execa';

export const getPcmOutputName = (inputName: string) => {
	const dirname = path.dirname(inputName);
	const extension = path.extname(inputName);
	const filename = path.basename(inputName, extension);

	return path.join(dirname, `${filename}-converted.pcm`);
};

const isMp3 = async (source: string) => {
	const {stderr} = await execa('ffprobe', [source]);

	return stderr.includes('Audio: mp3');
};

export const convertMp3ToPcm = async (source: string) => {
	if (!(await isMp3(source))) {
		return source;
	}

	const outname = getPcmOutputName(source);
	await execa('ffmpeg', [
		'-y',
		'-i',
		source,
		'-acodec',
		'pcm_s16le',
		'-ac',
		'1',
		'-ar',
		'48000',
		getPcmOutputName(source),
	]);
	return outname;
};

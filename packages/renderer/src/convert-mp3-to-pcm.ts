// For the h264-mkv format, we need to convert an MP3 file to PCM first

import execa from 'execa';
import path from 'path';

export const getPcmOutputName = (inputName: string) => {
	const dirname = path.dirname(inputName);
	const extension = path.extname(inputName);
	const filename = path.basename(inputName, extension);

	return path.join(dirname, `${filename}-converted.wav`);
};

const isMp3 = async (source: string) => {
	const {stderr} = await execa('ffprobe', [source]);

	return stderr.includes('Audio: mp3');
};

export const conversionStarted: {[key: string]: boolean} = {};

export const convertMp3ToPcm = async (source: string) => {
	const outname = getPcmOutputName(source);
	if (!(await isMp3(source))) {
		return source;
	}

	if (conversionStarted[source]) {
		return outname;
	}

	conversionStarted[source] = true;

	await execa('ffmpeg', ['-y', '-i', source, getPcmOutputName(source)]);
	return outname;
};

export const clearMp3Conversions = () => {
	Object.keys(conversionStarted).forEach((key) => {
		delete conversionStarted[key];
	});
};

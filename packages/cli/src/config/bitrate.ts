let audioBitrate: string | null = null;

export const setAudioBitrate = (bitrate: string) => {
	audioBitrate = bitrate;
};

export const getAudioBitrate = () => {
	return audioBitrate;
};

let videoBitrate: string | null = null;

export const setVideoBitrate = (bitrate: string) => {
	videoBitrate = bitrate;
};

export const getVideoBitrate = () => {
	return videoBitrate;
};

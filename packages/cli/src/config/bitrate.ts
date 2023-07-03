let audioBitrate: string | null = null;

export const setAudioBitrate = (bitrate: string | null) => {
	audioBitrate = bitrate;
};

export const getAudioBitrate = () => {
	return audioBitrate;
};

let videoBitrate: string | null = null;

export const setVideoBitrate = (bitrate: string | null) => {
	videoBitrate = bitrate;
};

export const getVideoBitrate = () => {
	return videoBitrate;
};

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

let maxRate: string | null = null;

export const setVideoMaxRate = (bitrate: string | null) => {
	maxRate = bitrate;
}

export const getVideoMaxRate = () => {
	return maxRate;
}

/**
 * bufSize is not a bitrate, but it is a bitrate-related option and get validated like a bitrate.
 */
let bufSize: string | null = null;

export const setVideoBufSize = (bitrate: string | null) => {
	bufSize = bitrate;
}

export const getVideoBufSize = () => {
	return bufSize;
}


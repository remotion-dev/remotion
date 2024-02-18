/**
 * encodingBufferSize is not a bitrate, but it is a bitrate-related option and get validated like a bitrate.
 */
let encodingBufferSize: string | null = null;

export const setEncodingBufferSize = (bitrate: string | null) => {
	encodingBufferSize = bitrate;
};

export const getEncodingBufferSize = () => {
	return encodingBufferSize;
};

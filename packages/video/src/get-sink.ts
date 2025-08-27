import {ALL_FORMATS, Input, UrlSource, VideoSampleSink} from 'mediabunny';

export const getVideoSink = async (src: string) => {
	const input = new Input({
		formats: ALL_FORMATS,
		source: new UrlSource(src),
	});

	const track = await input.getPrimaryVideoTrack();
	if (!track) {
		throw new Error(`No video track found for ${src}`);
	}

	const sink = new VideoSampleSink(track);
	return sink;
};

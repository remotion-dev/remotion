import type {VideoTrack} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import {getVideoDecoderConfigWithHardwareAcceleration} from './video-decoder-config';
import {getVideoEncoderConfig} from './video-encoder-config';

export const canReencodeVideoTrack = async ({
	videoCodec,
	track,
}: {
	videoCodec: ConvertMediaVideoCodec;
	track: VideoTrack;
}) => {
	const videoEncoderConfig = await getVideoEncoderConfig({
		codec: videoCodec,
		height: track.displayAspectHeight,
		width: track.displayAspectWidth,
		fps: track.fps,
	});
	const videoDecoderConfig =
		await getVideoDecoderConfigWithHardwareAcceleration(track);

	return Boolean(videoDecoderConfig && videoEncoderConfig);
};

import type {VideoTrack} from '@remotion/media-parser';
import type {ConvertMediaVideoCodec} from './get-available-video-codecs';
import type {ResizeOperation} from './resizing/mode';
import {calculateNewDimensionsFromRotateAndScale} from './rotation';
import {getVideoDecoderConfigWithHardwareAcceleration} from './video-decoder-config';
import {getVideoEncoderConfig} from './video-encoder-config';

export const canReencodeVideoTrack = async ({
	videoCodec,
	track,
	resizeOperation,
	rotate,
}: {
	videoCodec: ConvertMediaVideoCodec;
	track: VideoTrack;
	resizeOperation: ResizeOperation | null;
	rotate: number | null;
}) => {
	const {height, width} = calculateNewDimensionsFromRotateAndScale({
		height: track.displayAspectHeight,
		resizeOperation,
		rotation: rotate ?? 0,
		videoCodec,
		width: track.displayAspectWidth,
	});
	const videoEncoderConfig = await getVideoEncoderConfig({
		codec: videoCodec,
		height,
		width,
		fps: track.fps,
	});
	const videoDecoderConfig =
		await getVideoDecoderConfigWithHardwareAcceleration(track);

	return Boolean(videoDecoderConfig && videoEncoderConfig);
};

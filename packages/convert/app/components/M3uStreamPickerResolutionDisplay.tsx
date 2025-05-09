import type {M3uStream} from '@remotion/media-parser';

export const M3uStreamPickerResolutionDisplay: React.FC<{
	stream: M3uStream;
	allStreams: M3uStream[];
}> = ({stream, allStreams}) => {
	if (!stream.dimensions) {
		return null;
	}

	const multipleStreamsWithThisResolution =
		allStreams.filter(
			(s) =>
				s.dimensions &&
				s.dimensions.width === stream.dimensions?.width &&
				s.dimensions.height === stream.dimensions?.height,
		).length >= 2;

	const bandwidth =
		stream.averageBandwidthInBitsPerSec ?? stream.bandwidthInBitsPerSec;

	const str = [
		`${stream.dimensions.width}x${stream.dimensions.height}`,
		multipleStreamsWithThisResolution && bandwidth
			? `${Math.round(bandwidth / 1024 / 8)} kbps`
			: null,
	]
		.filter(Boolean)
		.join(', ');

	return <div>{str}</div>;
};

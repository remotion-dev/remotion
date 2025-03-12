import type {M3uStream} from '@remotion/media-parser';

export const M3uStreamPickerResolutionDisplay: React.FC<{
	stream: M3uStream;
	allStreams: M3uStream[];
}> = ({stream, allStreams}) => {
	if (!stream.resolution) {
		return null;
	}

	const multipleStreamsWithThisResolution =
		allStreams.filter(
			(s) =>
				s.resolution &&
				s.resolution.width === stream.resolution?.width &&
				s.resolution.height === stream.resolution?.height,
		).length >= 2;

	const bandwidth = stream.averageBandwidth ?? stream.bandwidth;

	const str = [
		`${stream.resolution.width}x${stream.resolution.height}`,
		multipleStreamsWithThisResolution && bandwidth
			? `${Math.round(bandwidth / 1024 / 8)} kbps`
			: null,
	]
		.filter(Boolean)
		.join(', ');

	return <div>{str}</div>;
};

/* eslint-disable @typescript-eslint/no-use-before-define */
import type {MatroskaSegment} from './segments';
import type {
	AudioSegment,
	ClusterSegment,
	CodecIdSegment,
	ColourSegment,
	DisplayHeightSegment,
	DisplayWidthSegment,
	HeightSegment,
	MainSegment,
	MatrixCoefficientsSegment,
	PrimariesSegment,
	RangeSegment,
	TimestampScaleSegment,
	TrackEntry,
	TrackNumberSegment,
	TrackTypeSegment,
	TransferCharacteristicsSegment,
	VideoSegment,
	WidthSegment,
} from './segments/all-segments';

export const getMainSegment = (
	segments: MatroskaSegment[],
): MainSegment | null => {
	return segments.find((s) => s.type === 'Segment') as MainSegment | null;
};

export const getTrackNumber = (track: TrackEntry) => {
	const child = track.value.find(
		(b) => b.type === 'TrackNumber',
	) as TrackNumberSegment | null;
	return child?.value ?? null;
};

export const getTrackCodec = (track: TrackEntry) => {
	const child = track.value.find(
		(b) => b.type === 'CodecID',
	) as CodecIdSegment | null;
	return child ?? null;
};

export const getTrackTimestampScale = (track: TrackEntry) => {
	const child = track.value.find((b) => b.type === 'TrackTimestampScale');
	if (!child) {
		return null;
	}

	if (child.type !== 'TrackTimestampScale') {
		throw new Error('Expected TrackTimestampScale');
	}

	return child.value;
};

export const getTrackByNumber = (tracks: TrackEntry[], id: number) => {
	return tracks.find((track) => {
		const trackNumber = getTrackNumber(track);
		return trackNumber?.value === id;
	});
};

export const getTrackId = (track: TrackEntry): number => {
	const trackId = track.value.find((b) => b.type === 'TrackNumber');
	if (!trackId || trackId.type !== 'TrackNumber') {
		throw new Error('Expected track number segment');
	}

	return trackId.value.value;
};

export const getCodecSegment = (track: TrackEntry): CodecIdSegment | null => {
	const codec = track.value.find((b) => b.type === 'CodecID');
	if (!codec || codec.type !== 'CodecID') {
		return null;
	}

	return codec;
};

export const getColourSegment = (track: TrackEntry): ColourSegment | null => {
	const videoSegment = getVideoSegment(track);
	if (!videoSegment) {
		return null;
	}

	const colour = videoSegment.value.find((b) => b.type === 'Colour');
	if (!colour || colour.type !== 'Colour') {
		return null;
	}

	return colour;
};

export const getTransferCharacteristicsSegment = (
	color: ColourSegment,
): TransferCharacteristicsSegment | null => {
	if (!color || color.type !== 'Colour') {
		return null;
	}

	const box = color.value.find((b) => b.type === 'TransferCharacteristics');
	if (!box || box.type !== 'TransferCharacteristics') {
		return null;
	}

	return box;
};

export const getMatrixCoefficientsSegment = (
	color: ColourSegment,
): MatrixCoefficientsSegment | null => {
	if (!color || color.type !== 'Colour') {
		return null;
	}

	const box = color.value.find((b) => b.type === 'MatrixCoefficients');
	if (!box || box.type !== 'MatrixCoefficients') {
		return null;
	}

	return box;
};

export const getPrimariesSegment = (
	color: ColourSegment,
): PrimariesSegment | null => {
	if (!color || color.type !== 'Colour') {
		return null;
	}

	const box = color.value.find((b) => b.type === 'Primaries');
	if (!box || box.type !== 'Primaries') {
		return null;
	}

	return box;
};

export const getRangeSegment = (color: ColourSegment): RangeSegment | null => {
	if (!color || color.type !== 'Colour') {
		return null;
	}

	const box = color.value.find((b) => b.type === 'Range');
	if (!box || box.type !== 'Range') {
		return null;
	}

	return box;
};

export const getDisplayHeightSegment = (
	track: TrackEntry,
): DisplayHeightSegment | null => {
	const videoSegment = getVideoSegment(track);
	if (!videoSegment) {
		return null;
	}

	const displayHeight = videoSegment.value.find(
		(b) => b.type === 'DisplayHeight',
	);

	if (!displayHeight || displayHeight.type !== 'DisplayHeight') {
		return null;
	}

	return displayHeight;
};

export const getTrackTypeSegment = (
	track: TrackEntry,
): TrackTypeSegment | null => {
	const trackType = track.value.find((b) => b.type === 'TrackType');
	if (!trackType || trackType.type !== 'TrackType') {
		return null;
	}

	return trackType;
};

export const getWidthSegment = (track: TrackEntry): WidthSegment | null => {
	const videoSegment = getVideoSegment(track);
	if (!videoSegment) {
		return null;
	}

	const width = videoSegment.value.find((b) => b.type === 'PixelWidth');

	if (!width || width.type !== 'PixelWidth') {
		return null;
	}

	return width;
};

export const getHeightSegment = (track: TrackEntry): HeightSegment | null => {
	const videoSegment = getVideoSegment(track);
	if (!videoSegment) {
		return null;
	}

	const height = videoSegment.value.find((b) => b.type === 'PixelHeight');

	if (!height || height.type !== 'PixelHeight') {
		return null;
	}

	return height;
};

export const getDisplayWidthSegment = (
	track: TrackEntry,
): DisplayWidthSegment | null => {
	const videoSegment = getVideoSegment(track);
	if (!videoSegment) {
		return null;
	}

	const displayWidth = videoSegment.value.find(
		(b) => b.type === 'DisplayWidth',
	);

	if (!displayWidth || displayWidth.type !== 'DisplayWidth') {
		return null;
	}

	return displayWidth;
};

export const getTracksSegment = (segment: MainSegment) => {
	const tracksSegment = segment.value.find((b) => b.type === 'Tracks');
	if (!tracksSegment) {
		return null;
	}

	return tracksSegment;
};

export const getTrackWithUid = (segment: MainSegment, trackUid: string) => {
	const tracksSegment = getTracksSegment(segment);
	if (!tracksSegment) {
		return null;
	}

	const trackEntries = tracksSegment.value.filter(
		(t) => t.type === 'TrackEntry',
	);
	const trackEntry = trackEntries.find((entry) => {
		return entry?.value.find(
			(t) => t.type === 'TrackUID' && t.value === trackUid,
		);
	});
	if (!trackEntry) {
		return null;
	}

	return (
		trackEntry.value.find((t) => t.type === 'TrackNumber')?.value.value ?? null
	);
};

export const getTimescaleSegment = (
	segment: MainSegment,
): TimestampScaleSegment | null => {
	const infoSegment = segment.value.find((b) => b.type === 'Info');

	if (!infoSegment || infoSegment.type !== 'Info') {
		return null;
	}

	const timescale = infoSegment.value.find((b) => b.type === 'TimestampScale');

	if (!timescale || timescale.type !== 'TimestampScale') {
		return null;
	}

	return timescale as TimestampScaleSegment;
};

export const getVideoSegment = (track: TrackEntry): VideoSegment | null => {
	const videoSegment = track.value.find((b) => b.type === 'Video');
	if (!videoSegment || videoSegment.type !== 'Video') {
		return null;
	}

	return videoSegment ?? null;
};

export const getAudioSegment = (track: TrackEntry): AudioSegment | null => {
	const audioSegment = track.value.find((b) => b.type === 'Audio');
	if (!audioSegment || audioSegment.type !== 'Audio') {
		return null;
	}

	return audioSegment ?? null;
};

export const getSampleRate = (track: TrackEntry): number | null => {
	const audioSegment = getAudioSegment(track);
	if (!audioSegment) {
		return null;
	}

	const samplingFrequency = audioSegment.value.find(
		(b) => b.type === 'SamplingFrequency',
	);

	if (!samplingFrequency || samplingFrequency.type !== 'SamplingFrequency') {
		return null;
	}

	return samplingFrequency.value.value;
};

export const getNumberOfChannels = (track: TrackEntry): number => {
	const audioSegment = getAudioSegment(track);
	if (!audioSegment) {
		throw new Error('Could not find audio segment');
	}

	const channels = audioSegment.value.find((b) => b.type === 'Channels');

	if (!channels || channels.type !== 'Channels') {
		return 1;
	}

	return channels.value.value;
};

export const getBitDepth = (track: TrackEntry): number | null => {
	const audioSegment = getAudioSegment(track);
	if (!audioSegment) {
		return null;
	}

	const bitDepth = audioSegment.value.find((b) => b.type === 'BitDepth');

	if (!bitDepth || bitDepth.type !== 'BitDepth') {
		return null;
	}

	return bitDepth.value.value;
};

export const getPrivateData = (track: TrackEntry): Uint8Array | null => {
	const privateData = track.value.find((b) => b.type === 'CodecPrivate');

	if (!privateData || privateData.type !== 'CodecPrivate') {
		return null;
	}

	return privateData.value;
};

export const getClusterSegment = (
	segment: MainSegment,
): ClusterSegment | null => {
	const clusterSegment = segment.value.find((b) => b.type === 'Cluster') as
		| ClusterSegment
		| undefined;

	return clusterSegment ?? null;
};

import type {FtypBox} from './boxes/iso-base-media/ftyp';
import type {MdhdBox} from './boxes/iso-base-media/mdhd';
import type {MoovBox} from './boxes/iso-base-media/moov/moov';
import type {MvhdBox} from './boxes/iso-base-media/mvhd';
import type {CttsBox} from './boxes/iso-base-media/stsd/ctts';
import type {StcoBox} from './boxes/iso-base-media/stsd/stco';
import type {StscBox} from './boxes/iso-base-media/stsd/stsc';
import type {StsdBox} from './boxes/iso-base-media/stsd/stsd';
import type {StssBox} from './boxes/iso-base-media/stsd/stss';
import type {StszBox} from './boxes/iso-base-media/stsd/stsz';
import type {SttsBox} from './boxes/iso-base-media/stsd/stts';
import type {TkhdBox} from './boxes/iso-base-media/tkhd';
import type {TrakBox} from './boxes/iso-base-media/trak/trak';
import type {
	AudioSegment,
	ClusterSegment,
	CodecIdSegment,
	DisplayHeightSegment,
	DisplayWidthSegment,
	HeightSegment,
	MainSegment,
	TimestampScaleSegment,
	TrackEntrySegment,
	TrackTypeSegment,
	VideoSegment,
	WidthSegment,
} from './boxes/webm/segments/all-segments';
import type {AnySegment, RegularBox} from './parse-result';

export const getFtypBox = (segments: AnySegment[]): FtypBox | null => {
	const ftypBox = segments.find((s) => s.type === 'ftyp-box');
	if (!ftypBox || ftypBox.type !== 'ftyp-box') {
		return null;
	}

	return ftypBox;
};

export const getMoovBox = (segments: AnySegment[]): MoovBox | null => {
	const moovBox = segments.find((s) => s.type === 'moov-box');
	if (!moovBox || moovBox.type !== 'moov-box') {
		return null;
	}

	return moovBox;
};

export const getMvhdBox = (moovBox: MoovBox): MvhdBox | null => {
	const mvHdBox = moovBox.children.find((s) => s.type === 'mvhd-box');

	if (!mvHdBox || mvHdBox.type !== 'mvhd-box') {
		return null;
	}

	return mvHdBox;
};

export const getTraks = (moovBox: MoovBox): TrakBox[] => {
	return moovBox.children.filter((s) => s.type === 'trak-box') as TrakBox[];
};

export const getTkhdBox = (trakBox: TrakBox): TkhdBox | null => {
	const tkhdBox = trakBox.children.find(
		(s) => s.type === 'tkhd-box',
	) as TkhdBox | null;

	return tkhdBox;
};

export const getMdiaBox = (trakBox: TrakBox): RegularBox | null => {
	const mdiaBox = trakBox.children.find(
		(s) => s.type === 'regular-box' && s.boxType === 'mdia',
	);

	if (!mdiaBox || mdiaBox.type !== 'regular-box') {
		return null;
	}

	return mdiaBox;
};

export const getMdhdBox = (trakBox: TrakBox): MdhdBox | null => {
	const mdiaBox = getMdiaBox(trakBox);

	if (!mdiaBox) {
		return null;
	}

	const mdhdBox = mdiaBox.children.find(
		(c) => c.type === 'mdhd-box',
	) as MdhdBox | null;

	return mdhdBox;
};

export const getStblBox = (trakBox: TrakBox): RegularBox | null => {
	const mdiaBox = getMdiaBox(trakBox);

	if (!mdiaBox) {
		return null;
	}

	const minfBox = mdiaBox.children.find(
		(s) => s.type === 'regular-box' && s.boxType === 'minf',
	);

	if (!minfBox || minfBox.type !== 'regular-box') {
		return null;
	}

	const stblBox = minfBox.children.find(
		(s) => s.type === 'regular-box' && s.boxType === 'stbl',
	);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	return stblBox;
};

export const getStsdBox = (trakBox: TrakBox): StsdBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stsdBox = stblBox.children.find(
		(s) => s.type === 'stsd-box',
	) as StsdBox | null;

	return stsdBox;
};

export const getVideoDescriptors = (trakBox: TrakBox): Uint8Array | null => {
	const stsdBox = getStsdBox(trakBox);

	if (!stsdBox) {
		return null;
	}

	const descriptors = stsdBox.samples.map((s) => {
		return s.type === 'video'
			? s.descriptors.map((d) => {
					return d.type === 'avcc-box'
						? d.description
						: d.type === 'hvcc-box'
							? d.data
							: null;
				})
			: [];
	});

	return descriptors.flat(1).filter(Boolean)[0] ?? null;
};

export const getStcoBox = (trakBox: TrakBox): StcoBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stcoBox = stblBox.children.find(
		(s) => s.type === 'stco-box',
	) as StcoBox | null;

	return stcoBox;
};

export const getSttsBox = (trakBox: TrakBox): SttsBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const sttsBox = stblBox.children.find(
		(s) => s.type === 'stts-box',
	) as SttsBox | null;

	return sttsBox;
};

export const getCttsBox = (trakBox: TrakBox): CttsBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const cttsBox = stblBox.children.find(
		(s) => s.type === 'ctts-box',
	) as CttsBox | null;

	return cttsBox;
};

export const getStszBox = (trakBox: TrakBox): StszBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stszBox = stblBox.children.find(
		(s) => s.type === 'stsz-box',
	) as StszBox | null;

	return stszBox;
};

export const getStscBox = (trakBox: TrakBox): StscBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stcoBox = stblBox.children.find(
		(b) => b.type === 'stsc-box',
	) as StscBox | null;

	return stcoBox;
};

export const getStssBox = (trakBox: TrakBox): StssBox | null => {
	const stblBox = getStblBox(trakBox);

	if (!stblBox || stblBox.type !== 'regular-box') {
		return null;
	}

	const stssBox = stblBox.children.find(
		(b) => b.type === 'stss-box',
	) as StssBox | null;

	return stssBox;
};

export const getClusterSegment = (
	segment: MainSegment,
): ClusterSegment | null => {
	const clusterSegment = segment.value.find((b) => b.type === 'Cluster') as
		| ClusterSegment
		| undefined;

	return clusterSegment ?? null;
};

export const getTracksSegment = (segment: MainSegment) => {
	const tracksSegment = segment.value.find((b) => b.type === 'Tracks');
	if (!tracksSegment || tracksSegment.type !== 'Tracks') {
		return null;
	}

	return tracksSegment;
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

export const getVideoSegment = (
	track: TrackEntrySegment,
): VideoSegment | null => {
	const videoSegment = track.value.find((b) => b.type === 'Video');
	if (!videoSegment || videoSegment.type !== 'Video') {
		return null;
	}

	return videoSegment ?? null;
};

export const getAudioSegment = (
	track: TrackEntrySegment,
): AudioSegment | null => {
	const audioSegment = track.value.find((b) => b.type === 'Audio');
	if (!audioSegment || audioSegment.type !== 'Audio') {
		return null;
	}

	return audioSegment ?? null;
};

export const getSampleRate = (track: TrackEntrySegment): number | null => {
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

	return samplingFrequency.value;
};

export const getNumberOfChannels = (track: TrackEntrySegment): number => {
	const audioSegment = getAudioSegment(track);
	if (!audioSegment) {
		throw new Error('Could not find audio segment');
	}

	const channels = audioSegment.value.find((b) => b.type === 'Channels');

	if (!channels || channels.type !== 'Channels') {
		return 1;
	}

	return channels.value;
};

export const getBitDepth = (track: TrackEntrySegment): number | null => {
	const audioSegment = getAudioSegment(track);
	if (!audioSegment) {
		return null;
	}

	const bitDepth = audioSegment.value.find((b) => b.type === 'BitDepth');

	if (!bitDepth || bitDepth.type !== 'BitDepth') {
		return null;
	}

	return bitDepth.value;
};

export const getPrivateData = (track: TrackEntrySegment): Uint8Array | null => {
	const privateData = track.value.find((b) => b.type === 'CodecPrivate');

	if (!privateData || privateData.type !== 'CodecPrivate') {
		return null;
	}

	return privateData.value;
};

export const getWidthSegment = (
	track: TrackEntrySegment,
): WidthSegment | null => {
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

export const getHeightSegment = (
	track: TrackEntrySegment,
): HeightSegment | null => {
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
	track: TrackEntrySegment,
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

export const getDisplayHeightSegment = (
	track: TrackEntrySegment,
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
	track: TrackEntrySegment,
): TrackTypeSegment | null => {
	const trackType = track.value.find((b) => b.type === 'TrackType');
	if (!trackType || trackType.type !== 'TrackType') {
		return null;
	}

	return trackType;
};

export const getTrackId = (track: TrackEntrySegment): number => {
	const trackId = track.value.find((b) => b.type === 'TrackNumber');
	if (!trackId || trackId.type !== 'TrackNumber') {
		throw new Error('Expected track number segment');
	}

	return trackId.value;
};

export const getCodecSegment = (
	track: TrackEntrySegment,
): CodecIdSegment | null => {
	const codec = track.value.find((b) => b.type === 'CodecID');
	if (!codec || codec.type !== 'CodecID') {
		return null;
	}

	return codec;
};

export const hasSkippedMdatProcessing = (anySegment: AnySegment[]) => {
	const mdat = anySegment.find((b) => b.type === 'mdat-box');
	if (!mdat) {
		return {
			skipped: false as const,
		};
	}

	if (mdat.type !== 'mdat-box') {
		throw new Error('Expected mdat-box');
	}

	if (mdat.samplesProcessed) {
		return {
			skipped: false as const,
		};
	}

	return {
		skipped: true,
		fileOffset: mdat.fileOffset,
	};
};

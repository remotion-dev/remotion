import type {Prettify} from '../parse-ebml';

export const matroskaElements = {
	Header: '0x1a45dfa3',
	EBMLMaxIDLength: '0x42f2',
	EBMLVersion: '0x4286',
	EBMLReadVersion: '0x42f7',
	EBMLMaxSizeLength: '0x42f3',
	DocType: '0x4282',
	DocTypeVersion: '0x4287',
	DocTypeReadVersion: '0x4285',
	Segment: '0x18538067',
	SeekHead: '0x114d9b74',
	Seek: '0x4dbb',
	SeekID: '0x53ab',
	SeekPosition: '0x53ac',
	Info: '0x1549a966',
	SegmentUUID: '0x73a4',
	SegmentFilename: '0x7384',
	PrevUUID: '0x3cb923',
	PrevFilename: '0x3c83ab',
	NextUUID: '0x3eb923',
	NextFilename: '0x3e83bb',
	SegmentFamily: '0x4444',
	ChapterTranslate: '0x6924',
	ChapterTranslateID: '0x69a5',
	ChapterTranslateCodec: '0x69bf',
	ChapterTranslateEditionUID: '0x69fc',
	TimestampScale: '0x2ad7b1',
	Duration: '0x4489',
	DateUTC: '0x4461',
	Title: '0x7ba9',
	MuxingApp: '0x4d80',
	WritingApp: '0x5741',
	Cluster: '0x1f43b675',
	Timestamp: '0xe7',
	SilentTracks: '0x5854',
	SilentTrackNumber: '0x58d7',
	Position: '0xa7',
	PrevSize: '0xab',
	SimpleBlock: '0xa3',
	BlockGroup: '0xa0',
	Block: '0xa1',
	BlockVirtual: '0xa2',
	BlockAdditions: '0x75a1',
	BlockMore: '0xa6',
	BlockAdditional: '0xa5',
	BlockAddID: '0xee',
	BlockDuration: '0x9b',
	ReferencePriority: '0xfa',
	ReferenceBlock: '0xfb',
	ReferenceVirtual: '0xfd',
	CodecState: '0xa4',
	DiscardPadding: '0x75a2',
	Slices: '0x8e',
	TimeSlice: '0xe8',
	LaceNumber: '0xcc',
	FrameNumber: '0xcd',
	BlockAdditionID: '0xcb',
	Delay: '0xce',
	SliceDuration: '0xcf',
	ReferenceFrame: '0xc8',
	ReferenceOffset: '0xc9',
	ReferenceTimestamp: '0xca',
	EncryptedBlock: '0xaf',
	Tracks: '0x1654ae6b',
	TrackEntry: '0xae',
	TrackNumber: '0xd7',
	TrackUID: '0x73c5',
	TrackType: '0x83',
	FlagEnabled: '0xb9',
	FlagDefault: '0x88',
	FlagForced: '0x55aa',
	FlagHearingImpaired: '0x55ab',
	FlagVisualImpaired: '0x55ac',
	FlagTextDescriptions: '0x55ad',
	FlagOriginal: '0x55ae',
	FlagCommentary: '0x55af',
	FlagLacing: '0x9c',
	MinCache: '0x6de7',
	MaxCache: '0x6df8',
	DefaultDuration: '0x23e383',
	DefaultDecodedFieldDuration: '0x234e7a',
	TrackTimestampScale: '0x23314f',
	TrackOffset: '0x537f',
	MaxBlockAdditionID: '0x55ee',
	BlockAdditionMapping: '0x41e4',
	BlockAddIDValue: '0x41f0',
	BlockAddIDName: '0x41a4',
	BlockAddIDType: '0x41e7',
	BlockAddIDExtraData: '0x41ed',
	Name: '0x536e',
	Language: '0x22b59c',
	LanguageBCP47: '0x22b59d',
	CodecID: '0x86',
	CodecPrivate: '0x63a2',
	CodecName: '0x258688',
	AttachmentLink: '0x7446',
	CodecSettings: '0x3a9697',
	CodecInfoURL: '0x3b4040',
	CodecDownloadURL: '0x26b240',
	CodecDecodeAll: '0xaa',
	TrackOverlay: '0x6fab',
	CodecDelay: '0x56aa',
	SeekPreRoll: '0x56bb',
	TrackTranslate: '0x6624',
	TrackTranslateTrackID: '0x66a5',
	TrackTranslateCodec: '0x66bf',
	TrackTranslateEditionUID: '0x66fc',
	Video: '0xe0',
	FlagInterlaced: '0x9a',
	FieldOrder: '0x9d',
	StereoMode: '0x53b8',
	AlphaMode: '0x53c0',
	OldStereoMode: '0x53b9',
	PixelWidth: '0xb0',
	PixelHeight: '0xba',
	PixelCropBottom: '0x54aa',
	PixelCropTop: '0x54bb',
	PixelCropLeft: '0x54cc',
	PixelCropRight: '0x54dd',
	DisplayWidth: '0x54b0',
	DisplayHeight: '0x54ba',
	DisplayUnit: '0x54b2',
	AspectRatioType: '0x54b3',
	UncompressedFourCC: '0x2eb524',
	GammaValue: '0x2fb523',
	FrameRate: '0x2383e3',
	Colour: '0x55b0',
	MatrixCoefficients: '0x55b1',
	BitsPerChannel: '0x55b2',
	ChromaSubsamplingHorz: '0x55b3',
	ChromaSubsamplingVert: '0x55b4',
	CbSubsamplingHorz: '0x55b5',
	CbSubsamplingVert: '0x55b6',
	ChromaSitingHorz: '0x55b7',
	ChromaSitingVert: '0x55b8',
	Range: '0x55b9',
	TransferCharacteristics: '0x55ba',
	Primaries: '0x55bb',
	MaxCLL: '0x55bc',
	MaxFALL: '0x55bd',
	MasteringMetadata: '0x55d0',
	PrimaryRChromaticityX: '0x55d1',
	PrimaryRChromaticityY: '0x55d2',
	PrimaryGChromaticityX: '0x55d3',
	PrimaryGChromaticityY: '0x55d4',
	PrimaryBChromaticityX: '0x55d5',
	PrimaryBChromaticityY: '0x55d6',
	WhitePointChromaticityX: '0x55d7',
	WhitePointChromaticityY: '0x55d8',
	LuminanceMax: '0x55d9',
	LuminanceMin: '0x55da',
	Projection: '0x7670',
	ProjectionType: '0x7671',
	ProjectionPrivate: '0x7672',
	ProjectionPoseYaw: '0x7673',
	ProjectionPosePitch: '0x7674',
	ProjectionPoseRoll: '0x7675',
	Audio: '0xe1',
	SamplingFrequency: '0xb5',
	OutputSamplingFrequency: '0x78b5',
	Channels: '0x9f',
	ChannelPositions: '0x7d7b',
	BitDepth: '0x6264',
	Emphasis: '0x52f1',
	TrackOperation: '0xe2',
	TrackCombinePlanes: '0xe3',
	TrackPlane: '0xe4',
	TrackPlaneUID: '0xe5',
	TrackPlaneType: '0xe6',
	TrackJoinBlocks: '0xe9',
	TrackJoinUID: '0xed',
	TrickTrackUID: '0xc0',
	TrickTrackSegmentUID: '0xc1',
	TrickTrackFlag: '0xc6',
	TrickMasterTrackUID: '0xc7',
	TrickMasterTrackSegmentUID: '0xc4',
	ContentEncodings: '0x6d80',
	ContentEncoding: '0x6240',
	ContentEncodingOrder: '0x5031',
	ContentEncodingScope: '0x5032',
	ContentEncodingType: '0x5033',
	ContentCompression: '0x5034',
	ContentCompAlgo: '0x4254',
	ContentCompSettings: '0x4255',
	ContentEncryption: '0x5035',
	ContentEncAlgo: '0x47e1',
	ContentEncKeyID: '0x47e2',
	ContentEncAESSettings: '0x47e7',
	AESSettingsCipherMode: '0x47e8',
	ContentSignature: '0x47e3',
	ContentSigKeyID: '0x47e4',
	ContentSigAlgo: '0x47e5',
	ContentSigHashAlgo: '0x47e6',
	Cues: '0x1c53bb6b',
	CuePoint: '0xbb',
	CueTime: '0xb3',
	CueTrackPositions: '0xb7',
	CueTrack: '0xf7',
	CueClusterPosition: '0xf1',
	CueRelativePosition: '0xf0',
	CueDuration: '0xb2',
	CueBlockNumber: '0x5378',
	CueCodecState: '0xea',
	CueReference: '0xdb',
	CueRefTime: '0x96',
	CueRefCluster: '0x97',
	CueRefNumber: '0x535f',
	CueRefCodecState: '0xeb',
	Attachments: '0x1941a469',
	AttachedFile: '0x61a7',
	FileDescription: '0x467e',
	FileName: '0x466e',
	FileMediaType: '0x4660',
	FileData: '0x465c',
	FileUID: '0x46ae',
	FileReferral: '0x4675',
	FileUsedStartTime: '0x4661',
	FileUsedEndTime: '0x4662',
	Chapters: '0x1043a770',
	EditionEntry: '0x45b9',
	EditionUID: '0x45bc',
	EditionFlagHidden: '0x45bd',
	EditionFlagDefault: '0x45db',
	EditionFlagOrdered: '0x45dd',
	EditionDisplay: '0x4520',
	EditionString: '0x4521',
	EditionLanguageIETF: '0x45e4',
	ChapterAtom: '0xb6',
	ChapterUID: '0x73c4',
	ChapterStringUID: '0x5654',
	ChapterTimeStart: '0x91',
	ChapterTimeEnd: '0x92',
	ChapterFlagHidden: '0x98',
	ChapterFlagEnabled: '0x4598',
	ChapterSegmentUUID: '0x6e67',
	ChapterSkipType: '0x4588',
	ChapterSegmentEditionUID: '0x6ebc',
	ChapterPhysicalEquiv: '0x63c3',
	ChapterTrack: '0x8f',
	ChapterTrackUID: '0x89',
	ChapterDisplay: '0x80',
	ChapString: '0x85',
	ChapLanguage: '0x437c',
	ChapLanguageBCP47: '0x437d',
	ChapCountry: '0x437e',
	ChapProcess: '0x6944',
	ChapProcessCodecID: '0x6955',
	ChapProcessPrivate: '0x450d',
	ChapProcessCommand: '0x6911',
	ChapProcessTime: '0x6922',
	ChapProcessData: '0x6933',
	Tags: '0x1254c367',
	Tag: '0x7373',
	Targets: '0x63c0',
	TargetTypeValue: '0x68ca',
	TargetType: '0x63ca',
	TagTrackUID: '0x63c5',
	TagEditionUID: '0x63c9',
	TagChapterUID: '0x63c4',
	TagAttachmentUID: '0x63c6',
	SimpleTag: '0x67c8',
	TagName: '0x45a3',
	TagLanguage: '0x447a',
	TagLanguageBCP47: '0x447b',
	TagDefault: '0x4484',
	TagDefaultBogus: '0x44b4',
	TagString: '0x4487',
	TagBinary: '0x4485',
	Void: '0xec',
	Crc32: '0xbf',
} as const;

const matroskaIds = Object.values(matroskaElements);

export const knownIdsWithOneLength = matroskaIds.filter(
	(id) => id.length === 4,
) as string[];

export const knownIdsWithTwoLength = matroskaIds.filter(
	(id) => id.length === 6,
) as string[];

export const knownIdsWithThreeLength = matroskaIds.filter(
	(id) => id.length === 8,
) as string[];

export const getSegmentName = (id: string) => {
	return Object.entries(matroskaElements).find(
		([, value]) => value === id,
	)?.[0];
};

export type MatroskaKey = keyof typeof matroskaElements;

export type MatroskaElement = (typeof matroskaElements)[MatroskaKey];

type EbmlType = 'string';

export type EbmlWithChildren = {
	name: MatroskaKey;
	type: 'children';
};

export type EbmlWithUint = {
	name: MatroskaKey;
	type: 'uint';
};

export type EbmlWithHexString = {
	name: MatroskaKey;
	type: 'hex-string';
};

export type EbmlWithString = {
	name: MatroskaKey;
	type: EbmlType;
};

export type EbmlWithFloat = {
	name: MatroskaKey;
	type: 'float';
};

export type EbmlWithUint8Array = {
	name: MatroskaKey;
	type: 'uint8array';
};

export type Ebml =
	| EbmlWithString
	| EbmlWithUint
	| EbmlWithChildren
	| EbmlWithFloat
	| EbmlWithHexString
	| EbmlWithUint8Array;

export const ebmlVersion = {
	name: 'EBMLVersion',
	type: 'uint',
} satisfies Ebml;

export const ebmlReadVersion = {
	name: 'EBMLReadVersion',
	type: 'uint',
} satisfies Ebml;

export const ebmlMaxIdLength = {
	name: 'EBMLMaxIDLength',
	type: 'uint',
} as const satisfies Ebml;

export const ebmlMaxSizeLength = {
	name: 'EBMLMaxSizeLength',
	type: 'uint',
} satisfies Ebml;

export const docType = {
	name: 'DocType',
	type: 'string',
} satisfies Ebml;

export const docTypeVersion = {
	name: 'DocTypeVersion',
	type: 'uint',
} satisfies Ebml;

export const docTypeReadVersion = {
	name: 'DocTypeReadVersion',
	type: 'uint',
} satisfies Ebml;

const voidEbml = {
	name: 'Void',
	type: 'uint8array',
} satisfies Ebml;

export type EmblTypes = {
	uint: number;
	float: number;
	string: string;
	children: Ebml[];
	void: undefined;
	'hex-string': string;
	uint8array: Uint8Array;
};

export const matroskaHeader = {
	name: 'Header',
	type: 'children',
} as const satisfies Ebml;

export const seekId = {
	name: 'SeekID',
	type: 'hex-string',
} as const satisfies Ebml;

export const _name = {
	name: 'Name',
	type: 'string',
} as const satisfies Ebml;

export const minCache = {
	name: 'MinCache',
	type: 'uint',
} as const satisfies Ebml;

export const maxCache = {
	name: 'MaxCache',
	type: 'uint',
} as const satisfies Ebml;

export const seekPosition = {
	name: 'SeekPosition',
	type: 'uint',
} as const satisfies Ebml;

export const seek = {
	name: 'Seek',
	type: 'children',
} as const satisfies Ebml;

export const seekHead = {
	name: 'SeekHead',
	type: 'children',
} as const satisfies Ebml;

export const voidHeader = {
	name: 'Void',
	type: 'uint8array',
} as const satisfies Ebml;

export const codecID = {
	name: 'CodecID',
	type: 'string',
} as const satisfies Ebml;

export const trackType = {
	name: 'TrackType',
	type: 'uint',
} as const satisfies Ebml;

export const widthType = {
	name: 'PixelWidth',
	type: 'uint',
} as const satisfies Ebml;

export const heightType = {
	name: 'PixelHeight',
	type: 'uint',
} as const satisfies Ebml;

export const muxingApp = {
	name: 'MuxingApp',
	type: 'string',
} as const satisfies Ebml;

export const duration = {
	name: 'Duration',
	type: 'float',
} as const satisfies Ebml;

export const timestampScale = {
	name: 'TimestampScale',
	type: 'uint',
} as const satisfies Ebml;

export const writingApp = {
	name: 'WritingApp',
	type: 'string',
} as const satisfies Ebml;

export const infoType = {
	name: 'Info',
	type: 'children',
} as const satisfies Ebml;

export const titleType = {
	name: 'Title',
	type: 'string',
} as const satisfies Ebml;

export const tagTrackUidType = {
	name: 'TagTrackUID',
	type: 'hex-string',
} as const satisfies Ebml;

export const samplingFrequency = {
	name: 'SamplingFrequency',
	type: 'float',
} as const satisfies Ebml;

export const channels = {
	name: 'Channels',
	type: 'uint',
} as const satisfies Ebml;

export const alphaMode = {
	name: 'AlphaMode',
	type: 'uint',
} as const satisfies Ebml;

export const interlaced = {
	name: 'FlagInterlaced',
	type: 'uint',
} as const satisfies Ebml;

export const bitDepth = {
	name: 'BitDepth',
	type: 'uint',
} as const satisfies Ebml;

export const displayWidth = {
	name: 'DisplayWidth',
	type: 'uint',
} as const satisfies Ebml;

export const displayHeight = {
	name: 'DisplayHeight',
	type: 'uint',
} as const satisfies Ebml;

export const displayUnit = {
	name: 'DisplayUnit',
	type: 'uint',
} as const satisfies Ebml;

export const flagLacing = {
	name: 'FlagLacing',
	type: 'uint',
} as const satisfies Ebml;

export const tagSegment = {
	name: 'Tag',
	type: 'children',
} as const satisfies Ebml;

export const tags = {
	name: 'Tags',
	type: 'children',
} as const satisfies Ebml;

export const trackNumber = {
	name: 'TrackNumber',
	type: 'uint',
} as const satisfies Ebml;

export const trackUID = {
	name: 'TrackUID',
	type: 'hex-string',
} as const satisfies Ebml;

export const color = {
	name: 'Colour',
	type: 'children',
} as const satisfies Ebml;

export const transferCharacteristics = {
	name: 'TransferCharacteristics',
	type: 'uint',
} as const satisfies Ebml;

export const matrixCoefficients = {
	name: 'MatrixCoefficients',
	type: 'uint',
} as const satisfies Ebml;

export const primaries = {
	name: 'Primaries',
	type: 'uint',
} as const satisfies Ebml;

export const range = {
	name: 'Range',
	type: 'uint',
} as const satisfies Ebml;

export const ChromaSitingHorz = {
	name: 'ChromaSitingHorz',
	type: 'uint',
} as const satisfies Ebml;

export const ChromaSitingVert = {
	name: 'ChromaSitingVert',
	type: 'uint',
} as const satisfies Ebml;

export const language = {
	name: 'Language',
	type: 'string',
} as const satisfies Ebml;

export const defaultDuration = {
	name: 'DefaultDuration',
	type: 'uint',
} as const satisfies Ebml;

export const codecPrivate = {
	name: 'CodecPrivate',
	type: 'uint8array',
} as const satisfies Ebml;

export const blockAdditionsSegment = {
	name: 'BlockAdditions',
	type: 'uint8array',
} as const satisfies Ebml;

export const maxBlockAdditionIdSegment = {
	name: 'MaxBlockAdditionID',
	type: 'uint',
} as const satisfies Ebml;

export const audioSegment = {
	name: 'Audio',
	type: 'children',
} as const satisfies Ebml;

export const videoSegment = {
	name: 'Video',
	type: 'children',
} as const satisfies Ebml;

export const flagDefault = {
	name: 'FlagDefault',
	type: 'uint',
} as const satisfies Ebml;

export const referenceBlock = {
	name: 'ReferenceBlock',
	type: 'uint',
} as const satisfies Ebml;

export const blockDurationSegment = {
	name: 'BlockDuration',
	type: 'uint',
} as const satisfies Ebml;

export const blockElement = {
	name: 'Block',
	type: 'uint8array',
} as const satisfies Ebml;

export const codecName = {
	name: 'CodecName',
	type: 'string',
} as const satisfies Ebml;

export const trackTimestampScale = {
	name: 'TrackTimestampScale',
	type: 'float',
} as const satisfies Ebml;

export const trackEntry = {
	name: 'TrackEntry',
	type: 'children',
} as const satisfies Ebml;

export const tracks = {
	name: 'Tracks',
	type: 'children',
} as const satisfies Ebml;

export const timestampEntry = {
	name: 'Timestamp',
	type: 'uint',
} as const satisfies Ebml;

export const block = {
	name: 'Block',
	type: 'uint8array',
} as const satisfies Ebml;

export const simpleBlock = {
	name: 'SimpleBlock',
	type: 'uint8array',
} as const satisfies Ebml;

export const blockGroup = {
	name: 'BlockGroup',
	type: 'children',
} as const satisfies Ebml;

export const segment = {
	name: 'Segment',
	type: 'children',
} as const satisfies Ebml;

export const cluster = {
	name: 'Cluster',
	type: 'children',
} as const satisfies Ebml;

export const targetsType = {
	name: 'Targets',
	type: 'children',
} as const satisfies Ebml;

export const simpleTagType = {
	name: 'SimpleTag',
	type: 'children',
} as const satisfies Ebml;

export const tagNameType = {
	name: 'TagName',
	type: 'string',
} as const satisfies Ebml;

export const tagStringType = {
	name: 'TagString',
	type: 'string',
} as const satisfies Ebml;

export type CodecIdSegment = EbmlParsed<typeof codecID>;
export type ColourSegment = EbmlParsed<typeof color>;
export type TransferCharacteristicsSegment = EbmlParsed<
	typeof transferCharacteristics
>;
export type PrimariesSegment = EbmlParsed<typeof primaries>;
export type RangeSegment = EbmlParsed<typeof range>;
export type MatrixCoefficientsSegment = EbmlParsed<typeof matrixCoefficients>;
export type TrackTypeSegment = EbmlParsed<typeof trackType>;
export type WidthSegment = EbmlParsed<typeof widthType>;
export type HeightSegment = EbmlParsed<typeof heightType>;
export type TimestampScaleSegment = EbmlParsed<typeof timestampScale>;
export type DurationSegment = EbmlParsed<typeof duration>;
export type DisplayWidthSegment = EbmlParsed<typeof displayWidth>;
export type DisplayHeightSegment = EbmlParsed<typeof displayHeight>;
export type TrackNumberSegment = EbmlParsed<typeof trackNumber>;
export type AudioSegment = EbmlParsed<typeof audioSegment>;
export type VideoSegment = EbmlParsed<typeof videoSegment>;
export type TrackEntry = EbmlParsed<typeof trackEntry>;
export type BlockSegment = EbmlParsed<typeof block>;
export type SimpleBlockSegment = EbmlParsed<typeof simpleBlock>;
export type MainSegment = EbmlParsed<typeof segment>;
export type ClusterSegment = EbmlParsed<typeof cluster>;
export type Tracks = EbmlParsed<typeof tracks>;

export type FloatWithSize = {value: number; size: '32' | '64'};
export type UintWithSize = {value: number; byteLength: number | null};

export type EbmlValue<
	T extends Ebml,
	Child = PossibleEbml,
> = T extends EbmlWithUint
	? UintWithSize
	: T extends EbmlWithString
		? string
		: T extends EbmlWithFloat
			? FloatWithSize
			: T extends EbmlWithHexString
				? string
				: T extends EbmlWithUint8Array
					? Uint8Array
					: T extends EbmlWithChildren
						? Child[]
						: never;

export type EbmlParsed<T extends Ebml> = {
	type: T['name'];
	value: EbmlValue<T>;
	minVintWidth: number | null;
};

export const ebmlMap = {
	[matroskaElements.Header]: matroskaHeader,
	[matroskaElements.DocType]: docType,
	[matroskaElements.Targets]: targetsType,
	[matroskaElements.SimpleTag]: simpleTagType,
	[matroskaElements.TagName]: tagNameType,
	[matroskaElements.TagString]: tagStringType,
	[matroskaElements.DocTypeVersion]: docTypeVersion,
	[matroskaElements.DocTypeReadVersion]: docTypeReadVersion,
	[matroskaElements.EBMLVersion]: ebmlVersion,
	[matroskaElements.EBMLReadVersion]: ebmlReadVersion,
	[matroskaElements.EBMLMaxIDLength]: ebmlMaxIdLength,
	[matroskaElements.EBMLMaxSizeLength]: ebmlMaxSizeLength,
	[matroskaElements.Void]: voidEbml,
	[matroskaElements.Cues]: {
		name: 'Cues',
		type: 'children',
	},
	[matroskaElements.CuePoint]: {
		name: 'CuePoint',
		type: 'children',
	},
	[matroskaElements.CueTime]: {
		name: 'CueTime',
		type: 'uint',
	},
	[matroskaElements.CueTrackPositions]: {
		name: 'CueTrackPositions',
		type: 'children',
	},
	[matroskaElements.CueClusterPosition]: {
		name: 'CueClusterPosition',
		type: 'uint',
	},
	[matroskaElements.CueRelativePosition]: {
		name: 'CueRelativePosition',
		type: 'uint',
	},
	[matroskaElements.CueBlockNumber]: {
		name: 'CueBlockNumber',
		type: 'uint',
	},
	[matroskaElements.CueTrack]: {
		name: 'CueTrack',
		type: 'uint',
	},
	[matroskaElements.DateUTC]: {
		name: 'DateUTC',
		type: 'uint8array',
	},
	[matroskaElements.TrackTimestampScale]: trackTimestampScale,
	[matroskaElements.CodecDelay]: {
		name: 'CodecDelay',
		type: 'uint8array',
	},
	[matroskaElements.SeekPreRoll]: {
		name: 'SeekPreRoll',
		type: 'uint8array',
	},
	[matroskaElements.DiscardPadding]: {
		name: 'DiscardPadding',
		type: 'uint8array',
	},
	[matroskaElements.OutputSamplingFrequency]: {
		name: 'OutputSamplingFrequency',
		type: 'uint8array',
	},
	[matroskaElements.CodecName]: codecName,
	[matroskaElements.Position]: {
		name: 'Position',
		type: 'uint8array',
	},
	[matroskaElements.SliceDuration]: {
		name: 'SliceDuration',
		type: 'uint8array',
	},
	[matroskaElements.TagTrackUID]: tagTrackUidType,
	[matroskaElements.SeekHead]: seekHead,
	[matroskaElements.Seek]: seek,
	[matroskaElements.SeekID]: seekId,
	[matroskaElements.Name]: _name,
	[matroskaElements.MinCache]: minCache,
	[matroskaElements.MaxCache]: maxCache,
	[matroskaElements.SeekPosition]: seekPosition,
	[matroskaElements.Crc32]: {
		name: 'Crc32',
		type: 'uint8array',
	},
	[matroskaElements.MuxingApp]: muxingApp,
	[matroskaElements.WritingApp]: {
		name: 'WritingApp',
		type: 'string',
	},
	[matroskaElements.SegmentUUID]: {
		name: 'SegmentUUID',
		type: 'string',
	},
	[matroskaElements.Duration]: duration,
	[matroskaElements.CodecID]: {
		name: 'CodecID',
		type: 'string',
	},
	[matroskaElements.TrackType]: trackType,
	[matroskaElements.PixelWidth]: widthType,
	[matroskaElements.PixelHeight]: heightType,
	[matroskaElements.TimestampScale]: timestampScale,
	[matroskaElements.Info]: infoType,
	[matroskaElements.Title]: titleType,
	[matroskaElements.SamplingFrequency]: samplingFrequency,
	[matroskaElements.Channels]: channels,
	[matroskaElements.AlphaMode]: alphaMode,
	[matroskaElements.FlagInterlaced]: interlaced,
	[matroskaElements.BitDepth]: bitDepth,
	[matroskaElements.DisplayHeight]: displayHeight,
	[matroskaElements.DisplayWidth]: displayWidth,
	[matroskaElements.DisplayUnit]: displayUnit,
	[matroskaElements.FlagLacing]: flagLacing,
	[matroskaElements.Tags]: tags,
	[matroskaElements.Tag]: tagSegment,
	[matroskaElements.TrackNumber]: trackNumber,
	[matroskaElements.TrackUID]: trackUID,
	[matroskaElements.Colour]: color,
	[matroskaElements.Language]: language,
	[matroskaElements.DefaultDuration]: defaultDuration,
	[matroskaElements.CodecPrivate]: codecPrivate,
	[matroskaElements.BlockDuration]: blockDurationSegment,
	[matroskaElements.BlockAdditions]: blockAdditionsSegment,
	[matroskaElements.MaxBlockAdditionID]: maxBlockAdditionIdSegment,
	[matroskaElements.Audio]: audioSegment,
	[matroskaElements.Video]: videoSegment,
	[matroskaElements.FlagDefault]: flagDefault,
	[matroskaElements.ReferenceBlock]: referenceBlock,
	[matroskaElements.TrackEntry]: trackEntry,
	[matroskaElements.Timestamp]: {
		name: 'Timestamp',
		type: 'uint',
	},
	[matroskaElements.Tracks]: tracks,
	[matroskaElements.Block]: block,
	[matroskaElements.SimpleBlock]: simpleBlock,
	[matroskaElements.BlockGroup]: blockGroup,
	[matroskaElements.Segment]: {
		name: 'Segment',
		type: 'children',
	},
	[matroskaElements.Cluster]: {
		name: 'Cluster',
		type: 'children',
	},
	[matroskaElements.TransferCharacteristics]: transferCharacteristics,
	[matroskaElements.MatrixCoefficients]: matrixCoefficients,
	[matroskaElements.Primaries]: primaries,
	[matroskaElements.Range]: range,
	[matroskaElements.ChromaSitingHorz]: ChromaSitingHorz,
	[matroskaElements.ChromaSitingVert]: ChromaSitingVert,
} as const satisfies Partial<Record<MatroskaElement, Ebml>>;

export type PossibleEbml = Prettify<
	{
		[key in keyof typeof ebmlMap]: EbmlParsed<(typeof ebmlMap)[key]>;
	}[keyof typeof ebmlMap]
>;

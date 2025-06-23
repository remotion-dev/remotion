export type ParseMediaFields = {
	dimensions: boolean;
	durationInSeconds: boolean;
	slowDurationInSeconds: boolean;
	slowStructure: boolean;
	fps: boolean;
	slowFps: boolean;
	videoCodec: boolean;
	audioCodec: boolean;
	tracks: boolean;
	rotation: boolean;
	unrotatedDimensions: boolean;
	internalStats: boolean;
	size: boolean;
	name: boolean;
	container: boolean;
	isHdr: boolean;
	metadata: boolean;
	location: boolean;
	mimeType: boolean;
	keyframes: boolean;
	slowKeyframes: boolean;
	slowNumberOfFrames: boolean;
	slowVideoBitrate: boolean;
	slowAudioBitrate: boolean;
	images: boolean;
	sampleRate: boolean;
	numberOfAudioChannels: boolean;
	m3uStreams: boolean;
};

export type AllOptions<Fields extends ParseMediaFields> = {
	dimensions: Fields['dimensions'];
	durationInSeconds: Fields['durationInSeconds'];
	slowDurationInSeconds: Fields['slowDurationInSeconds'];
	slowFps: Fields['slowFps'];
	slowStructure: Fields['slowStructure'];
	fps: Fields['fps'];
	videoCodec: Fields['videoCodec'];
	audioCodec: Fields['audioCodec'];
	tracks: Fields['tracks'];
	rotation: Fields['rotation'];
	unrotatedDimensions: Fields['unrotatedDimensions'];
	internalStats: Fields['internalStats'];
	size: Fields['size'];
	name: Fields['name'];
	container: Fields['container'];
	isHdr: Fields['isHdr'];
	metadata: Fields['metadata'];
	location: Fields['location'];
	mimeType: Fields['mimeType'];
	keyframes: Fields['keyframes'];
	slowKeyframes: Fields['slowKeyframes'];
	slowNumberOfFrames: Fields['slowNumberOfFrames'];
	images: Fields['images'];
	sampleRate: Fields['sampleRate'];
	numberOfAudioChannels: Fields['numberOfAudioChannels'];
	slowVideoBitrate: Fields['slowVideoBitrate'];
	slowAudioBitrate: Fields['slowAudioBitrate'];
	m3uStreams: Fields['m3uStreams'];
};

export type Options<Fields extends ParseMediaFields> = Partial<
	AllOptions<Fields>
>;

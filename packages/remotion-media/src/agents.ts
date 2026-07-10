export type MediaVariant = {
	readonly videoCodec: string;
	readonly audioCodec: string;
	readonly container: string;
	readonly fileNames: readonly string[];
	readonly size: number;
	readonly category: string;
	readonly attribution?: string;
};

const categoryLabelMap: Record<string, string> = {
	codecs: 'Codecs',
	dimensions: 'Dimensions',
	durations: 'Durations',
	audio: 'Audio',
	fps: 'FPS',
	'sample-rates': 'Sample Rates',
	greenscreen: 'Green Screen',
	'edge-cases': 'Edge Cases',
	'sound-effects': 'Sound Effects',
	hls: 'HLS',
};

export const getCategoryLabel = (category: string) =>
	categoryLabelMap[category] ?? category;

const formatBytes = (size: number) =>
	size < 1024 * 1024
		? `${(size / 1024).toFixed(0)} KB`
		: `${(size / 1024 / 1024).toFixed(1)} MB`;

const formatCodec = (codec: string, type: 'audio' | 'video') => {
	if (codec === 'none') {
		return type === 'audio' ? 'No audio' : 'No video';
	}

	return codec.toUpperCase();
};

const formatCodecWithType = (codec: string, type: 'audio' | 'video') =>
	codec === 'none'
		? formatCodec(codec, type)
		: `${formatCodec(codec, type)} ${type}`;

const formatCodecs = (variant: MediaVariant) =>
	[
		variant.container.toUpperCase(),
		formatCodecWithType(variant.videoCodec, 'video'),
		formatCodecWithType(variant.audioCodec, 'audio'),
	].join(', ');

const formatVariant = (variant: MediaVariant) => {
	const primaryFile = variant.fileNames[0];
	const url = `https://remotion.media/${primaryFile}`;

	return [
		`### ${primaryFile}`,
		'',
		`- ${url}`,
		`- Codecs: ${formatCodecs(variant)}`,
		`- ${formatBytes(variant.size)}`,
	].join('\n');
};

export const makeAgentsMarkdown = (mediaVariants: readonly MediaVariant[]) => {
	const groups = new Map<string, MediaVariant[]>();

	for (const variant of mediaVariants) {
		if (!groups.has(variant.category)) {
			groups.set(variant.category, []);
		}

		groups.get(variant.category)?.push(variant);
	}

	const categories = [...groups.keys()];

	return `${[
		'# remotion.media',
		'',
		'Plaintext catalog for agents using the Remotion test media library.',
		'',
		'Base URL pattern: `https://remotion.media/[filename]`',
		'',
		'Files may be used royalty-free and without attribution unless an item states otherwise.',
		'',
		'## Categories',
		'',
		...categories.map((category) => `- ${getCategoryLabel(category)}`),
		'',
		...categories.flatMap((category) => [
			`## ${getCategoryLabel(category)}`,
			'',
			...(groups.get(category) ?? []).flatMap((variant) => [
				formatVariant(variant),
				'',
			]),
		]),
	].join('\n')}\n`;
};

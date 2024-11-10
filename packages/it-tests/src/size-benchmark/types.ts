export type QualityControl =
	| {
			type: 'crf';
			crf: number;
	  }
	| {
			type: 'bitrate';
			value: string;
	  };

export const encoders = ['libx264', 'h264_videotoolbox'] as const;
export type Encoder = (typeof encoders)[number];

export type BenchmarkItem = {
	filename: string;
	encoder: string;
	quality: QualityControl;
	width: number;
	height: number;
	fps: number;
	durationInSeconds: number;
	size: number;
	timeToEncodeInMs: number;
};

const stringifyQualityControl = (qualityControl: QualityControl) => {
	if (qualityControl.type === 'crf') {
		return `crf-${qualityControl.crf}`;
	}

	if (qualityControl.type === 'bitrate') {
		return `bitrate-${qualityControl.value}`;
	}

	throw new Error(
		'Unknown quality control type ' + (qualityControl satisfies never),
	);
};

export const getBenchmarkKey = ({
	filename,
	encoder,
	qualityControl,
}: {
	filename: string;
	encoder: string;
	qualityControl: QualityControl;
}) => {
	return [filename, encoder, stringifyQualityControl(qualityControl)].join('-');
};

export const getBenchmarkKeyFromItem = (item: BenchmarkItem) => {
	return getBenchmarkKey({
		filename: item.filename,
		encoder: item.encoder,
		qualityControl: item.quality,
	});
};

export const printBenchmark = (item: BenchmarkItem) => {
	console.log(
		item.filename,
		item.encoder,
		JSON.stringify(item.quality),
		item.width + 'x' + item.height,
		item.fps + 'fps',
		item.durationInSeconds + 's',
		item.size + ' bytes',
	);
};

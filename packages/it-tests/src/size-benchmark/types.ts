export type QualityControl = {
	type: 'crf';
	crf: number;
};

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

	throw new Error(
		'Unknown quality control type ' + (qualityControl.type satisfies never),
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

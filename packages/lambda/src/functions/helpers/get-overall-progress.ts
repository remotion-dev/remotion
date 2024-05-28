type Factors = 'invoking' | 'rendering' | 'frames' | 'encoding';

const weights: {[key in Factors]: number} = {
	encoding: 0.225,
	rendering: 0.225,
	frames: 0.225,
	invoking: 0.225,
};

export const getOverallProgress = ({
	encoding,
	rendering,
	invoking,
	frames,
}: {
	encoding: number;
	rendering: number;
	invoking: number;
	frames: number;
}) => {
	return (
		encoding * weights.encoding +
		rendering * weights.rendering +
		invoking * weights.invoking +
		frames * weights.frames
	);
};

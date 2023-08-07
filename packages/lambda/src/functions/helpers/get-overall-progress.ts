type Factors = 'invoking' | 'rendering' | 'frames' | 'encoding' | 'cleanup';

const weights: {[key in Factors]: number} = {
	cleanup: 0.1,
	encoding: 0.225,
	rendering: 0.225,
	frames: 0.225,
	invoking: 0.225,
};

export const getOverallProgress = ({
	cleanup,
	encoding,
	rendering,
	invoking,
	frames,
}: {
	cleanup: number;
	encoding: number;
	rendering: number;
	invoking: number;
	frames: number;
}) => {
	return (
		cleanup * weights.cleanup +
		encoding * weights.encoding +
		rendering * weights.rendering +
		invoking * weights.invoking +
		frames * weights.frames
	);
};

type Factors = 'invoking' | 'rendering' | 'encoding' | 'cleanup';

const weights: {[key in Factors]: number} = {
	cleanup: 0.1,
	encoding: 0.3,
	rendering: 0.3,
	invoking: 0.3,
};

export const getOverallProgress = ({
	cleanup,
	encoding,
	rendering,
	invoking,
}: {
	cleanup: number;
	encoding: number;
	rendering: number;
	invoking: number;
}) => {
	return (
		cleanup * weights.cleanup +
		encoding * weights.encoding +
		rendering * weights.rendering +
		invoking * weights.invoking
	);
};

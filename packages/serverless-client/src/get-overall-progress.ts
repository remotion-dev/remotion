type Factors = 'invoking' | 'frames' | 'encoding' | 'evaluating' | 'combining';

const weights: {[key in Factors]: number} = {
	evaluating: 0.1,
	encoding: 0.1,
	frames: 0.6,
	invoking: 0.1,
	combining: 0.1,
};

export const getOverallProgress = ({
	encoding,
	invoking,
	frames,
	invokedLambda,
	visitedServeUrl,
	gotComposition,
	combining,
}: {
	invokedLambda: number;
	visitedServeUrl: number | null;
	gotComposition: number | null;
	encoding: number;
	invoking: number;
	frames: number;
	combining: number;
}) => {
	const evaluationProgress =
		[
			Boolean(invokedLambda),
			Boolean(visitedServeUrl),
			Boolean(gotComposition),
		].reduce((a, b) => Number(a) + Number(b), 0) / 3;

	return (
		evaluationProgress * weights.evaluating +
		encoding * weights.encoding +
		invoking * weights.invoking +
		frames * weights.frames +
		combining * weights.combining
	);
};

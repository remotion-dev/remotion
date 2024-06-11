type Factors =
	| 'invoking'
	| 'rendering'
	| 'frames'
	| 'encoding'
	| 'evaluating'
	| 'combining';

const weights: {[key in Factors]: number} = {
	evaluating: 0.1,
	encoding: 0.1,
	rendering: 0.4,
	frames: 0.2,
	invoking: 0.1,
	combining: 0.1,
};

export const getOverallProgress = ({
	encoding,
	rendering,
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
	rendering: number;
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
		rendering * weights.rendering +
		invoking * weights.invoking +
		frames * weights.frames +
		combining * weights.combining
	);
};

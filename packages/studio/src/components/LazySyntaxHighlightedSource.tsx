import React, {lazy, Suspense} from 'react';

const sourceStyle: React.CSSProperties = {
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
	color: 'inherit',
};

type SourceComponent = React.FC<{
	readonly source: string;
}>;

const PlainSource: SourceComponent = ({source}) => (
	<span style={sourceStyle}>{source}</span>
);

let loadedSource: SourceComponent | null = null;
let sourcePromise: Promise<{default: SourceComponent}> | null = null;

export const loadSyntaxHighlightedSource = () => {
	if (sourcePromise === null) {
		sourcePromise = import('./SyntaxHighlightedSource')
			.catch(() => ({default: PlainSource}))
			.then((module) => {
				loadedSource = module.default;
				return module;
			});
	}

	return sourcePromise;
};

const SyntaxHighlightedSource = lazy(loadSyntaxHighlightedSource);

export const LazySyntaxHighlightedSource: SourceComponent = ({source}) => {
	// React.lazy can suspend on its first render even after preloading finishes.
	const LoadedSource = loadedSource;
	if (LoadedSource !== null) {
		return <LoadedSource source={source} />;
	}

	return (
		<Suspense
			fallback={
				<span style={{...sourceStyle, visibility: 'hidden'}}>{source}</span>
			}
		>
			<SyntaxHighlightedSource source={source} />
		</Suspense>
	);
};

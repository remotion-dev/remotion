import React, {lazy, Suspense} from 'react';

const SyntaxHighlightedSource = lazy(() => import('./SyntaxHighlightedSource'));

const fallbackStyle: React.CSSProperties = {
	visibility: 'hidden',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

export const LazySyntaxHighlightedSource: React.FC<{
	readonly source: string;
}> = ({source}) => {
	return (
		<Suspense fallback={<span style={fallbackStyle}>{source}</span>}>
			<SyntaxHighlightedSource source={source} />
		</Suspense>
	);
};

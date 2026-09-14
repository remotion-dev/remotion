import React, {lazy, Suspense} from 'react';

const SyntaxHighlightedSource = lazy(() => import('./SyntaxHighlightedSource'));

export const LazySyntaxHighlightedSource: React.FC<{
	readonly source: string;
}> = ({source}) => {
	return (
		<Suspense fallback={source}>
			<SyntaxHighlightedSource source={source} />
		</Suspense>
	);
};

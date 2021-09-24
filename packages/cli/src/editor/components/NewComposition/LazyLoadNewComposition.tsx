import React, {Suspense, useMemo} from 'react';
import {CompType} from './CompositionType';

export const LazyLoadNewComposition: React.FC<{
	initialCompType: CompType;
}> = (props) => {
	const OtherComponent = useMemo(() => {
		return React.lazy(() => import('./NewComposition'));
	}, []);
	return (
		<Suspense fallback={<div>loading...</div>}>
			<OtherComponent initialCompType={props.initialCompType} />
		</Suspense>
	);
};

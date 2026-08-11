import React from 'react';
import {Skeleton} from './ui/skeleton';

export const SelectionSkeleton: React.FC = () => {
	return (
		<div>
			<Skeleton className="h-4 w-[100px] inline-block mt-2" />
			<Skeleton className="h-10 w-full block" />
		</div>
	);
};

import {Button} from '@remotion/design';
import React from 'react';

export const MixingButton: React.FC<{
	readonly onClick: () => void;
	readonly active: boolean;
	readonly children: React.ReactNode;
}> = ({onClick, active, children}) => {
	return (
		<Button
			onClick={onClick}
			depth={0.5}
			className={`px-2 w-10 h-10 rounded-full align-middle transition-colors text-2xl font-bold ${
				active ? 'bg-brand text-white' : 'bg-white text-muted-foreground'
			}`}
		>
			{children}
		</Button>
	);
};

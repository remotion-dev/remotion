import React from 'react';
import {Button} from './ui/button';

export const PauseResumeAndCancel: React.FC<{
	readonly onAbort: () => void;
}> = ({onAbort}) => {
	return (
		<Button
			variant={'brandsecondary'}
			className="block w-full"
			type="button"
			onClick={onAbort}
		>
			Cancel
		</Button>
	);
};

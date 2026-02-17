import {Button} from '@remotion/design';
import React from 'react';
import {LoadFromUrl} from './LoadFromUrl';

export const AlternativePickFileOptions: React.FC<{
	readonly onSampleFile: () => void;
}> = ({onSampleFile}) => {
	return (
		<div className="flex flex-row items-center justify-center gap-3">
			<Button
				className="font-brand text-brand rounded-full text-sm h-10"
				onClick={onSampleFile}
			>
				Use a sample file
			</Button>
			<LoadFromUrl />
		</div>
	);
};

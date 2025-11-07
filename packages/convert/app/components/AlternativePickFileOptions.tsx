import {Button} from '@remotion/design';
import React from 'react';
import {LoadFromUrl} from './LoadFromUrl';

export const AlternativePickFileOptions: React.FC<{
	readonly onSampleFile: () => void;
}> = ({onSampleFile}) => {
	return (
		<div className="flex flex-row items-center justify-center gap-3">
			<a
				className="font-brand text-brand cursor cursor-pointer"
				onClick={onSampleFile}
			>
				<Button className="rounded-full text-sm h-10">Use a sample file</Button>
			</a>
			<LoadFromUrl />
		</div>
	);
};

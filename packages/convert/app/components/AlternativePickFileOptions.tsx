import React from 'react';
import {LoadFromUrl} from './LoadFromUrl';
import {LoadFromX} from './LoadFromX';

export const AlternativePickFileOptions: React.FC<{
	readonly onSampleFile: () => void;
}> = ({onSampleFile}) => {
	return (
		<div>
			<a
				className="font-brand text-brand cursor cursor-pointer hover:underline"
				onClick={onSampleFile}
			>
				Use a sample file
			</a>
			<div className="w-4" />
			<LoadFromUrl />
			<div className="w-4" />
			<LoadFromX />
		</div>
	);
};

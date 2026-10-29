import {ActionLink} from './ActionLink';
import React from 'react';
import {LoadFromUrl} from './LoadFromUrl';

export const AlternativePickFileOptions: React.FC<{
	readonly onSampleFile: () => void;
}> = ({onSampleFile}) => {
	return (
		<div className="flex flex-col items-start gap-1 min-[900px]:items-end">
			<ActionLink onClick={onSampleFile}>Use a sample file</ActionLink>
			<LoadFromUrl />
		</div>
	);
};

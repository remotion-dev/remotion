import React, {useCallback} from 'react';
import {SAMPLE_FILE} from '~/lib/config';
import {DropFileBox} from './DropFileBox';

export const PickFile: React.FC<{
	readonly setSrc: (str: string) => void;
}> = ({setSrc}) => {
	const onSampleFile = useCallback(() => {
		setSrc(SAMPLE_FILE);
	}, [setSrc]);

	return (
		<div className="text-center items-center justify-center flex flex-col">
			<h1 className="text-center text-4xl font-brand font-bold">
				Fast video conversion in the browser
			</h1>
			<div className="h-12" />
			<DropFileBox />
			or <a onClick={onSampleFile}>Select a sample file</a>
		</div>
	);
};

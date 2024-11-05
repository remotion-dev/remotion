import React, {useCallback} from 'react';
import {SAMPLE_FILE} from '~/lib/config';
import {Source} from '~/lib/convert-state';
import {DropFileBox} from './DropFileBox';

export const PickFile: React.FC<{
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({setSrc}) => {
	const onSampleFile = useCallback(() => {
		setSrc({type: 'url', url: SAMPLE_FILE});
	}, [setSrc]);

	return (
		<div className="text-center items-center justify-center flex flex-col">
			<h1 className="text-center text-4xl font-brand font-bold">
				Fast video conversion in the browser
			</h1>
			<div className="h-12" />
			<DropFileBox setSrc={setSrc} />
			or{' '}
			<a className="font-brand text-brand" onClick={onSampleFile}>
				or select sample file
			</a>
		</div>
	);
};

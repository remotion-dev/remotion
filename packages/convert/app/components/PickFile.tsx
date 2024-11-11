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

	const onDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			const file = event.dataTransfer.files[0];
			if (file) {
				setSrc({type: 'file', file});
			}
		},
		[setSrc],
	);

	const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	}, []);

	return (
		<div
			className="text-center items-center justify-center flex flex-col h-full w-full p-4 pt-20"
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<h1 className="text-center text-4xl font-brand font-bold">
				Fast video conversion in the browser
			</h1>
			<div className="h-12" />
			<DropFileBox setSrc={setSrc} />
			<div className="h-4" />
			<div className="font-brand">or </div>
			<div className="h-4" />
			<a
				className="font-brand text-brand cursor cursor-pointer hover:underline"
				onClick={onSampleFile}
			>
				Use a sample file
			</a>
		</div>
	);
};

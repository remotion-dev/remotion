import React, {useCallback} from 'react';
import {SAMPLE_FILE} from '~/lib/config';
import type {Source} from '~/lib/convert-state';
import {DropFileBox} from './DropFileBox';
import {TextMarkLogo} from './TextMarkLogo';
import {WhyRemotionConvert} from './WhyRemotionConvert';

export const PickFile: React.FC<{
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
	readonly title: string;
}> = ({setSrc, title}) => {
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
			className="text-center items-center justify-center flex flex-col h-full w-full"
			onDragOver={onDragOver}
			onDrop={onDrop}
		>
			<div className="bg-slate-50 w-full">
				<div className="h-10" />
				<TextMarkLogo />
				<div className="h-5" />
				<div className="w-full pb-4">
					<h1 className="text-center text-3xl font-brand font-black max-w-[600px] m-auto text-balance px-4">
						{title}
					</h1>
				</div>
				<div className="h-4" />
				<div className="p-4 w-full text-center">
					<DropFileBox setSrc={setSrc} />
				</div>
				<div className="h-4" />
				<div className="font-brand">or </div>
				<div className="h-4" />
				<a
					className="font-brand text-brand cursor cursor-pointer hover:underline"
					onClick={onSampleFile}
				>
					Use a sample file
				</a>
				<div className="h-10" />
			</div>
			<div className="w-full bg-white border-t-2 border-black">
				<WhyRemotionConvert />
			</div>
		</div>
	);
};

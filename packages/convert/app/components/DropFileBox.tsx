import React, {useCallback, useRef} from 'react';
import type {Source} from '~/lib/convert-state';
import {Button} from './ui/button';

export const DropFileBox: React.FC<{
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({setSrc}) => {
	const ref = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				setSrc({type: 'file', file});
				// eslint-disable-next-line no-console
				console.log('File selected:', file.name);
				// Add your file handling logic here
			}
		},
		[setSrc],
	);

	return (
		<div className="w-full max-w-[600px] lg:w-[400px] m-auto flex justify-center items-center">
			<input
				ref={ref}
				type="file"
				id="fileInput"
				className="hidden"
				onChange={handleFileChange}
			/>
			<Button onClick={() => ref.current?.click()}>Choose file</Button>
		</div>
	);
};

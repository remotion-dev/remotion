import React, {useCallback, useRef} from 'react';
import {Source} from '~/lib/convert-state';
import {Button} from './ui/button';
import {Card} from './ui/card';

export const DropFileBox: React.FC<{
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({setSrc}) => {
	const ref = useRef<HTMLInputElement>(null);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			if (file) {
				setSrc({type: 'file', file});
				console.log('File selected:', file.name);
				// Add your file handling logic here
			}
		},
		[setSrc],
	);

	return (
		<Card className="w-full max-w-[600px] lg:w-[400px] h-[300px] flex justify-center items-center">
			<input
				ref={ref}
				type="file"
				id="fileInput"
				className="hidden"
				onChange={handleFileChange}
			/>
			<Button onClick={() => ref.current?.click()}>Choose files</Button>
		</Card>
	);
};

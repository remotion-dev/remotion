import React, {useCallback} from 'react';
import type {Source} from '~/lib/convert-state';
import {Button} from './ui/button';

export const BackButton: React.FC<{
	readonly setSrc: React.Dispatch<React.SetStateAction<Source | null>>;
}> = ({setSrc}) => {
	const clear = useCallback(() => {
		setSrc(null);
	}, [setSrc]);

	return (
		<div className="block lg:h-10">
			<div className="flex items-center">
				<Button variant="link" onClick={clear}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 448 512"
						style={{height: 16}}
					>
						<path
							fill="currentcolor"
							d="M18.2 273l-17-17 17-17L171.8 85.4l17-17 33.9 33.9-17 17L93.1 232 424 232l24 0 0 48-24 0L93.1 280 205.8 392.6l17 17-33.9 33.9-17-17L18.2 273z"
						/>
					</svg>
					<div className="w-2" />
					Choose another file
				</Button>
			</div>
		</div>
	);
};

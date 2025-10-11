import React from 'react';
import {Img, staticFile} from 'remotion';

export const StaticDemo: React.FC<{
	readonly flag: boolean;
}> = ({flag}) => {
	if (!flag) {
		throw new Error('`flag` must be true (this only works during rendering)');
	}

	return (
		<>
			<Img src={staticFile('nested/logö.png')} />
			<Img src={staticFile('/nested/mp4.png')} />
		</>
	);
};

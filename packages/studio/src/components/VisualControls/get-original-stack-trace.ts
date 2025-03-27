import {useEffect, useState} from 'react';
import type {OriginalPosition} from '../../error-overlay/react-overlay/utils/get-source-map';
import {getOriginalLocationFromStack} from '../Timeline/TimelineStack/get-stack';

export const useOriginalFileName = (stack: string) => {
	const [originalFileName, setOriginalFileName] =
		useState<OriginalPosition | null>(null);

	useEffect(() => {
		if (!stack) {
			return;
		}

		getOriginalLocationFromStack(stack, 'visual-control')
			.then((frame) => {
				setOriginalFileName(frame);
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error('Could not get original location of Sequence', err);
			});
	}, [stack]);

	return originalFileName;
};

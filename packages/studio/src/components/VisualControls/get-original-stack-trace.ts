import {useEffect, useState} from 'react';
import {getOriginalLocationFromStack} from '../Timeline/TimelineStack/get-stack';
import type {OriginalFileNameState} from './ClickableFileName';

export const useOriginalFileName = (stack: string): OriginalFileNameState => {
	const [originalFileName, setOriginalFileName] =
		useState<OriginalFileNameState>({type: 'loading'});

	useEffect(() => {
		if (!stack) {
			return;
		}

		getOriginalLocationFromStack(stack, 'visual-control')
			.then((frame) => {
				if (frame === null) {
					setOriginalFileName({
						type: 'error',
						error: new Error('No frame found'),
					});
				} else {
					setOriginalFileName({type: 'loaded', originalFileName: frame});
				}
			})
			.catch((err) => {
				// eslint-disable-next-line no-console
				console.error('Could not get original location of Sequence', err);
			});
	}, [stack]);

	return originalFileName;
};

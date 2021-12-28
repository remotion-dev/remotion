import React, {useCallback} from 'react';
import {StackFrame} from '../react-overlay/utils/stack-frame';
import {Button} from './Button';

export const OpenInEditor: React.FC<{
	stack: StackFrame;
}> = ({stack}) => {
	const openInBrowser = useCallback(() => {
		fetch(`/api/open-in-editor`, {
			method: 'post',
			headers: {
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				stack,
			}),
		})
			.then(() => {
				console.log('opened');
			})
			.catch((err) => {
				console.log('could not open', err);
			});
	}, [stack]);
	return <Button onClick={openInBrowser}>Open in editor</Button>;
};

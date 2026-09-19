import React, {useCallback, useContext} from 'react';
import {SetSelectedModalContext} from '../../state/modals';
import {renderQueueItemSubtitleStyle} from './item-style';

const errorStyle: React.CSSProperties = {
	...renderQueueItemSubtitleStyle,
};

export const QueueJobError: React.FC<{
	readonly error: {message: string; stack: string | undefined};
	readonly modalTitle: string;
}> = ({error, modalTitle}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const onClick = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			setSelectedModal({
				type: 'queue-job-error',
				title: modalTitle,
				error: {message: error.message, stack: error.stack ?? null},
			});
		},
		[error, modalTitle, setSelectedModal],
	);

	return (
		<button
			onClick={onClick}
			type="button"
			style={errorStyle}
			title={error.message}
		>
			{error.message}
		</button>
	);
};

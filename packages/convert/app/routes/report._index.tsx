import React, {useCallback} from 'react';
import {handleDrop} from '~/lib/upload-report';

const Report: React.FC = () => {
	const onDrop: React.DragEventHandler = useCallback(async (e) => {
		const firstItem = e.dataTransfer?.files?.[0];
		if (!firstItem) {
			return;
		}

		e.preventDefault();

		await handleDrop(firstItem);
	}, []);

	return (
		<div>
			<input onDrop={onDrop} type="text" placeholder="Video URL" />
			<h1>Report a video</h1>
		</div>
	);
};

export default Report;

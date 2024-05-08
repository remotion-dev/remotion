import {deleteStaticFile} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill, staticFile, useVideoConfig} from 'remotion';

export const DeleteStaticFile: React.FC = () => {
	const {id} = useVideoConfig();

	const onDeleteFile = useCallback(async () => {
		const res = await deleteStaticFile('framer.webm');
		console.log(res);
	}, []);

	const onDeleteNestedFile = useCallback(async () => {
		const res = await deleteStaticFile('nested/mp4.png');
		console.log(res);
	}, []);

	const onDeleteFileWithPrefix = useCallback(async () => {
		const res = await deleteStaticFile(staticFile('framer.webm'));
		console.log(res);
	}, []);

	const onDeleteNonExistentFile = useCallback(async () => {
		const res = await deleteStaticFile('non-existent.webm');
		console.log(res);
	}, []);

	return (
		<AbsoluteFill>
			<button type="button" onClick={onDeleteFile}>
				Delete framer
			</button>
			<button type="button" onClick={onDeleteNestedFile}>
				Delete nested
			</button>
			<button type="button" onClick={onDeleteNonExistentFile}>
				Delete non-existent
			</button>
			<button type="button" onClick={onDeleteFileWithPrefix}>
				Delete with prefix
			</button>
		</AbsoluteFill>
	);
};

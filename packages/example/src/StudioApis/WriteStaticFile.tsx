import {writeStaticFile} from '@remotion/studio';
import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';

export const WriteStaticFile: React.FC = () => {
	const saveFileRegular = useCallback(async () => {
		await writeStaticFile({
			filePath: 'hitehre',
			contents: 'hello world',
		});

		console.log('Saved!');
	}, []);

	const saveFileSubfolder = useCallback(async () => {
		await writeStaticFile({
			filePath: 'hitehre/yooo',
			contents: 'hello world',
		});

		console.log('Saved!');
	}, []);
	const saveFileBackslash = useCallback(async () => {
		await writeStaticFile({
			filePath: 'hitehre\\backslash',
			contents: 'hello world',
		});

		console.log('Saved!');
	}, []);
	const dontAllowOtherFolderThanPublic = useCallback(async () => {
		await writeStaticFile({
			filePath: '../otherfolder/hitehre',
			contents: 'hello world',
		});

		console.log('Saved!');
	}, []);

	return (
		<AbsoluteFill>
			<button type="button" onClick={saveFileRegular}>
				save a file
			</button>
			<button type="button" onClick={saveFileSubfolder}>
				subfolder
			</button>
			<button type="button" onClick={saveFileBackslash}>
				backslash
			</button>
			<button type="button" onClick={dontAllowOtherFolderThanPublic}>
				other folder (should error)
			</button>
		</AbsoluteFill>
	);
};

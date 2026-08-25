import {useContext} from 'react';
import {Internals} from 'remotion';
import {getPreviewFileType} from '../../helpers/get-preview-file-type';
import {EditorShowRulersContext} from '../../state/editor-rulers';

export const useIsRulerVisible = () => {
	const {canvasContent, currentAssetMetadata} = useContext(
		Internals.CompositionManager,
	);
	const {editorShowRulers} = useContext(EditorShowRulersContext);

	return (
		editorShowRulers &&
		canvasContent !== null &&
		(canvasContent.type === 'composition' ||
			(canvasContent.type === 'asset' &&
				getPreviewFileType(canvasContent.asset) === 'video' &&
				currentAssetMetadata?.asset === canvasContent.asset))
	);
};

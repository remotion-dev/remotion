import {useContext} from 'react';
import {Internals} from 'remotion';
import {EditorShowRulersContext} from '../../state/editor-rulers';

export const useIsRulerVisible = () => {
	const {canvasContent} = useContext(Internals.CompositionManager);
	const {editorShowRulers} = useContext(EditorShowRulersContext);

	return (
		editorShowRulers && canvasContent && canvasContent.type === 'composition'
	);
};

import React, {useCallback, useMemo, useState} from 'react';
import {
	EditorShowRulersContext,
	loadEditorShowRulersOption,
	persistEditorShowRulersOption,
} from '../state/editor-rulers';

export const ShowRulersProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [editorShowRulers, setEditorShowRulersState] = useState(() =>
		loadEditorShowRulersOption(),
	);
	const setEditorShowRulers = useCallback(
		(newValue: (prevState: boolean) => boolean) => {
			setEditorShowRulersState((prevState) => {
				const newVal = newValue(prevState);
				persistEditorShowRulersOption(newVal);
				return newVal;
			});
		},
		[],
	);

	const editorShowRulersCtx = useMemo(() => {
		return {
			editorShowRulers,
			setEditorShowRulers,
		};
	}, [editorShowRulers, setEditorShowRulers]);

	return (
		<EditorShowRulersContext.Provider value={editorShowRulersCtx}>
			{children}
		</EditorShowRulersContext.Provider>
	);
};

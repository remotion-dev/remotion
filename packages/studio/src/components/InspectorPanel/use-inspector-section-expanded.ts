import {useCallback, useState} from 'react';
import {
	loadPersistedBooleanMap,
	persistBooleanMap,
} from '../../helpers/persist-boolean-map';

const storageKey = 'remotion.editor.inspectorCollapsedSections';

export const useInspectorSectionExpanded = (sectionId: string) => {
	const [collapsedSections, setCollapsedSections] = useState(() =>
		loadPersistedBooleanMap(storageKey),
	);
	const setExpanded = useCallback(
		(expanded: boolean) => {
			setCollapsedSections((previous) => ({
				...previous,
				[sectionId]: !expanded,
			}));
			persistBooleanMap(storageKey, {
				...loadPersistedBooleanMap(storageKey),
				[sectionId]: !expanded,
			});
		},
		[sectionId],
	);

	return [!collapsedSections[sectionId], setExpanded] as const;
};

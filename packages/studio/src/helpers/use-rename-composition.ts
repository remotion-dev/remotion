import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import {useCallback, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {renameComposition as renameCompositionApi} from '../components/RenderQueue/actions';
import {slugifyName} from './slugify-name';
import {getRoute, pushUrl} from './url-state';
import {validateCompositionName} from './validate-new-comp-data';

export const useRenameComposition = ({
	compositions,
	currentId,
	newId,
}: {
	compositions: _InternalTypes['AnyComposition'][];
	currentId: string;
	newId: string;
}) => {
	const getValidationMessage = useCallback(
		(value: string) => {
			const slug = slugifyName(value);
			if (slug === currentId) {
				return null;
			}

			return slug
				? validateCompositionName(slug, compositions)
				: 'Enter an ID containing letters or numbers.';
		},
		[compositions, currentId],
	);

	const compositionId = slugifyName(newId);
	const validationMessage = useMemo(() => {
		return getValidationMessage(newId);
	}, [getValidationMessage, newId]);

	const valid = validationMessage === null && currentId !== compositionId;

	const renameComposition = useCallback(
		async ({
			newCompositionId,
			signal,
			symbolicatedStack,
		}: {
			newCompositionId: string;
			signal: AbortSignal;
			symbolicatedStack: SymbolicatedStackFrame | null;
		}) => {
			const nextCompositionId = slugifyName(newCompositionId);
			const result = await renameCompositionApi(
				{
					idToRename: currentId,
					newId: nextCompositionId,
					symbolicatedStack,
					undoRedoNavigation: {
						undoRoute: getRoute(),
						redoRoute: `/${nextCompositionId}`,
					},
				},
				signal,
			);

			if (result.success) {
				pushUrl(`/${nextCompositionId}`);
			}

			return result;
		},
		[currentId],
	);

	return {
		compositionId,
		getValidationMessage,
		renameComposition,
		valid,
		validationMessage,
	};
};

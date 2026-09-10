import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {useCallback, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {applyCodemod} from '../components/RenderQueue/actions';
import {slugifyName} from './slugify-name';
import {pushUrl} from './url-state';
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

	const getCodemod = useCallback(
		(value: string): RecastCodemod => {
			return {
				type: 'rename-composition',
				idToRename: currentId,
				newId: slugifyName(value),
			};
		},
		[currentId],
	);

	const compositionId = slugifyName(newId);
	const validationMessage = useMemo(() => {
		return getValidationMessage(newId);
	}, [getValidationMessage, newId]);

	const codemod = useMemo(() => {
		return getCodemod(newId);
	}, [getCodemod, newId]);

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
			const result = await applyCodemod({
				codemod: getCodemod(newCompositionId),
				dryRun: false,
				signal,
				symbolicatedStack,
			});

			if (result.success) {
				pushUrl(`/${slugifyName(newCompositionId)}`);
			}

			return result;
		},
		[getCodemod],
	);

	return {
		codemod,
		compositionId,
		getValidationMessage,
		renameComposition,
		valid,
		validationMessage,
	};
};

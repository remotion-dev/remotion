import type {
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {useCallback, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {applyCodemod} from '../components/RenderQueue/actions';
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
			if (value === currentId) {
				return null;
			}

			return validateCompositionName(value, compositions);
		},
		[compositions, currentId],
	);

	const getCodemod = useCallback(
		(value: string): RecastCodemod => {
			return {
				type: 'rename-composition',
				idToRename: currentId,
				newId: value,
			};
		},
		[currentId],
	);

	const validationMessage = useMemo(() => {
		return getValidationMessage(newId);
	}, [getValidationMessage, newId]);

	const codemod = useMemo(() => {
		return getCodemod(newId);
	}, [getCodemod, newId]);

	const valid = validationMessage === null && currentId !== newId;

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
				pushUrl(`/${newCompositionId}`);
			}

			return result;
		},
		[getCodemod],
	);

	return {
		codemod,
		getValidationMessage,
		renameComposition,
		valid,
		validationMessage,
	};
};

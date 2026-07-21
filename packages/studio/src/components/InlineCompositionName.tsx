import type * as React from 'react';
import {useCallback, useMemo} from 'react';
import type {_InternalTypes} from 'remotion';
import {resolvedStackToSymbolicated} from '../helpers/resolved-stack-to-symbolicated';
import {useRenameComposition} from '../helpers/use-rename-composition';
import {InlineEditableTitle} from './InlineEditableTitle';
import {showNotification} from './Notifications/NotificationCenter';
import {useResolvedStack} from './Timeline/use-resolved-stack';

export const InlineCompositionName: React.FC<{
	readonly compositionId: string;
	readonly stack: string | null;
	readonly compositions: _InternalTypes['AnyComposition'][];
}> = ({compositionId, stack, compositions}) => {
	const canRename = !window.remotion_isReadOnlyStudio;
	const resolvedLocation = useResolvedStack(stack);
	const symbolicatedStack = useMemo(
		() => resolvedStackToSymbolicated(resolvedLocation),
		[resolvedLocation],
	);
	const {getValidationMessage, renameComposition} = useRenameComposition({
		compositions,
		currentId: compositionId,
		newId: compositionId,
	});

	const commit = useCallback(
		(newId: string) => {
			if (newId === compositionId) {
				return;
			}

			const compNameErrMessage = getValidationMessage(newId);
			if (compNameErrMessage) {
				showNotification(compNameErrMessage, 2000);

				return;
			}

			if (!stack || !symbolicatedStack) {
				showNotification(
					'Could not determine where this composition is defined',
					2000,
				);

				return;
			}

			const notification = showNotification('Renaming...', null);

			renameComposition({
				newCompositionId: newId,
				signal: new AbortController().signal,
				symbolicatedStack,
			})
				.then((result) => {
					if (!result.success) {
						notification.replaceContent(
							`Could not rename composition: ${result.reason}`,
							2000,
						);
						return;
					}

					notification.replaceContent(`Renamed to ${newId}`, 2000);
				})
				.catch((err) => {
					notification.replaceContent(
						`Could not rename composition: ${(err as Error).message}`,
						2000,
					);
				});
		},
		[
			compositionId,
			getValidationMessage,
			renameComposition,
			stack,
			symbolicatedStack,
		],
	);

	return (
		<InlineEditableTitle
			value={compositionId}
			canRename={canRename}
			onCommit={commit}
			size="inspector"
		/>
	);
};

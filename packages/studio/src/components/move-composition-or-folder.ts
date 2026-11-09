import type {CompositionDestination} from '@remotion/studio-shared';
import {
	applyOptimisticCompositionOperation,
	type CompositionRegistrySnapshot,
} from '../helpers/optimistic-composition-operations';
import type {SetSelectedModalContextType} from '../state/modals';
import {
	compositionSelectorDragDataToSymbolicatedStack,
	type CompositionSelectorDragData,
} from './composition-selector-drag-data';
import {showNotification} from './Notifications/NotificationCenter';
import {moveComposition, moveFolder} from './RenderQueue/actions';
import {getCachedResolvedStack} from './Timeline/use-resolved-stack';

export const moveCompositionOrFolder = async ({
	dragData,
	destination,
	destinationFile,
	getSnapshot,
	setSelectedModal,
}: {
	readonly dragData: CompositionSelectorDragData;
	readonly destination: CompositionDestination;
	readonly destinationFile: string | null;
	readonly getSnapshot: () => CompositionRegistrySnapshot;
	readonly setSelectedModal: SetSelectedModalContextType['setSelectedModal'];
}) => {
	const {item: source, sourceFile} = dragData;
	try {
		const result = await applyOptimisticCompositionOperation({
			operation: {
				type: 'move',
				item: source,
				destination,
				sourceFile,
				destinationFile,
			},
			getSnapshot,
			persist: () => {
				const {signal} = new AbortController();
				const common = {
					destination,
					destinationFile,
					symbolicatedStack:
						compositionSelectorDragDataToSymbolicatedStack(dragData),
					undoRedoNavigation: null,
				};
				return source.type === 'composition'
					? moveComposition(
							{...common, compositionId: source.compositionId},
							signal,
						)
					: moveFolder(
							{
								...common,
								folderName: source.folderName,
								parentName: source.parentName,
							},
							signal,
						);
			},
		});
		if (!result.success) {
			if (result.canRefactor) {
				const snapshot = getSnapshot();
				const target =
					destination.type === 'root'
						? null
						: destination.type === 'folder'
							? {
									type: 'folder' as const,
									folderName: destination.folderName,
									parentName: destination.parentName,
								}
							: destination.target;
				const sourceLocations = [source, target].flatMap((item) => {
					if (item === null) return [];
					const stack =
						item.type === 'composition'
							? snapshot.compositions.find(
									(composition) => composition.id === item.compositionId,
								)?.stack
							: snapshot.folders.find(
									(folder) =>
										folder.name === item.folderName &&
										folder.parent === item.parentName,
								)?.stack;
					const location = getCachedResolvedStack(stack ?? null);
					return location ? [location] : [];
				});
				setSelectedModal({
					type: 'reorder-composition',
					item: source,
					destination,
					sourceFile,
					destinationFile,
					sourceLocations,
				});
			} else {
				showNotification(result.reason, 4000);
			}
		}
	} catch (error) {
		showNotification(
			error instanceof Error ? error.message : String(error),
			4000,
		);
	}
};

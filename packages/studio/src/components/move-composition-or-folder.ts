import type {CompositionDestination} from '@remotion/studio-shared';
import {
	applyOptimisticCompositionOperation,
	type CompositionRegistrySnapshot,
} from '../helpers/optimistic-composition-operations';
import {
	compositionSelectorDragDataToSymbolicatedStack,
	type CompositionSelectorDragData,
} from './composition-selector-drag-data';
import {moveComposition, moveFolder} from './RenderQueue/actions';

export const moveCompositionOrFolder = ({
	dragData,
	destination,
	destinationFile,
	getSnapshot,
}: {
	readonly dragData: CompositionSelectorDragData;
	readonly destination: CompositionDestination;
	readonly destinationFile: string | null;
	readonly getSnapshot: () => CompositionRegistrySnapshot;
}) => {
	const {item: source, sourceFile} = dragData;
	return applyOptimisticCompositionOperation({
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
};

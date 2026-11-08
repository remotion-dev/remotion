import type {
	CompositionDestination,
	CompositionOrFolder,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {
	applyOptimisticCompositionOperation,
	type CompositionRegistrySnapshot,
} from '../helpers/optimistic-composition-operations';
import {moveComposition, moveFolder} from './RenderQueue/actions';

export const moveCompositionOrFolder = ({
	source,
	destination,
	destinationFile,
	symbolicatedStack,
	getSnapshot,
}: {
	readonly source: CompositionOrFolder;
	readonly destination: CompositionDestination;
	readonly destinationFile: string | null;
	readonly symbolicatedStack: SymbolicatedStackFrame | null;
	readonly getSnapshot: () => CompositionRegistrySnapshot;
}) => {
	return applyOptimisticCompositionOperation({
		operation: {type: 'move', item: source, destination},
		getSnapshot,
		persist: () => {
			const {signal} = new AbortController();
			const common = {
				destination,
				destinationFile,
				symbolicatedStack,
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

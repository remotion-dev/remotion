import type {
	DuplicateCompositionResponse,
	RecastCodemod,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {applyCodemod} from '../RenderQueue/actions';

export const duplicateComposition = ({
	codemod,
	dryRun,
	signal,
	symbolicatedStack,
}: {
	codemod: Extract<RecastCodemod, {type: 'duplicate-composition'}>;
	dryRun: boolean;
	signal: AbortSignal;
	symbolicatedStack: SymbolicatedStackFrame | null;
}): Promise<DuplicateCompositionResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations === null) {
		return applyCodemod({codemod, dryRun, signal, symbolicatedStack}).then(
			(result) => (result.success ? result : {...result, stack: ''}),
		);
	}

	return browserStudioOperations.duplicateComposition({
		codemod,
		dryRun,
	});
};

import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';

export const openInEditor = (stack: SymbolicatedStackFrame) => {
	const {
		originalFileName,
		originalLineNumber,
		originalColumnNumber,
		originalFunctionName,
		originalScriptCode,
	} = stack;

	return fetch(`/api/open-in-editor`, {
		method: 'post',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			stack: {
				originalFileName,
				originalLineNumber,
				originalColumnNumber,
				originalFunctionName,
				originalScriptCode,
			},
		}),
	});
};

export const openOriginalPositionInEditor = async (
	originalPosition: OriginalPosition,
) => {
	await openInEditor({
		originalColumnNumber: originalPosition.column,
		originalFileName: originalPosition.source,
		originalFunctionName: null,
		originalLineNumber: originalPosition.line,
		originalScriptCode: null,
	});
};

type ResolveCompositionComponentResponse =
	| {
			success: true;
			location: OriginalPosition;
	  }
	| {
			success: false;
			error: string;
	  };

export const openCompositionComponentInEditor = async ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string;
	compositionId: string;
}) => {
	const response = await fetch(`/api/resolve-composition-component`, {
		method: 'post',
		headers: {
			'content-type': 'application/json',
		},
		body: JSON.stringify({
			compositionFile,
			compositionId,
		}),
	});
	const body = (await response.json()) as ResolveCompositionComponentResponse;
	if (!body.success) {
		throw new Error(body.error);
	}

	await openOriginalPositionInEditor(body.location);
};

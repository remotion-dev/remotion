import type {SymbolicatedStackFrame} from '@remotion/studio-shared';

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

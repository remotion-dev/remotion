import type {SymbolicatedStackFrame} from '../../preview-server/error-overlay/react-overlay/utils/stack-frame';

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

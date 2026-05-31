import type {
	CompositionComponentInfoResponse,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';

export const openInEditor = (stack: SymbolicatedStackFrame) => {
	const {
		originalFileName,
		originalLineNumber,
		originalColumnNumber,
		originalFunctionName,
		originalScriptCode,
	} = stack;

	return callApi('/api/open-in-editor', {
		stack: {
			originalFileName,
			originalLineNumber,
			originalColumnNumber,
			originalFunctionName,
			originalScriptCode,
		},
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

const componentResolutionCache = new Map<
	string,
	Promise<{
		location: CompositionComponentInfoResponse['location'];
		canAddSequence: boolean;
	}>
>();

const getComponentResolutionCacheKey = ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string;
	compositionId: string;
}) => {
	return `${compositionFile}::${compositionId}`;
};

const loadCompositionComponentInfo = async ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string;
	compositionId: string;
}) => {
	const cacheKey = getComponentResolutionCacheKey({
		compositionFile,
		compositionId,
	});
	const existing = componentResolutionCache.get(cacheKey);
	if (existing) {
		return existing;
	}

	const promise = (async () => {
		const body = await callApi('/api/composition-component-info', {
			compositionFile,
			compositionId,
		});

		return {
			location: body.location,
			canAddSequence: body.canAddSequence,
		};
	})();
	componentResolutionCache.set(cacheKey, promise);

	try {
		return await promise;
	} catch (err) {
		componentResolutionCache.delete(cacheKey);
		throw err;
	}
};

export const preloadCompositionComponentInfo = ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string;
	compositionId: string;
}) => {
	loadCompositionComponentInfo({
		compositionFile,
		compositionId,
	}).catch(() => undefined);
};

export const openCompositionComponentInEditor = async ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string;
	compositionId: string;
}) => {
	const info = await loadCompositionComponentInfo({
		compositionFile,
		compositionId,
	});
	await openOriginalPositionInEditor(info.location);
};

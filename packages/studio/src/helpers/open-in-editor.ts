import type {
	CompositionComponentInfoResponse,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {getBrowserStudioServer} from '@remotion/studio-shared';
import {useEffect, useSyncExternalStore} from 'react';
import {callApi} from '../components/call-api';
import type {
	CodePosition,
	OriginalPosition,
} from '../error-overlay/react-overlay/utils/get-source-map';

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

export const openOriginalPositionInEditorAtProperty = async ({
	originalPosition,
	property,
}: {
	originalPosition: CodePosition;
	property: string;
}) => {
	const position = await callApi('/api/find-in-file', {
		fileName: originalPosition.source,
		lineNumber: originalPosition.line,
		columnNumber: originalPosition.column,
		search: property,
	});

	await openOriginalPositionInEditor({
		source: originalPosition.source,
		line: position.lineNumber,
		column: position.columnNumber,
	});
};

type ResolvedCompositionComponentInfo = {
	location: CompositionComponentInfoResponse['location'];
	canAddSequence: boolean;
};

const componentResolutionCache = new Map<
	string,
	Promise<ResolvedCompositionComponentInfo>
>();
const componentResolutionResults = new Map<
	string,
	ResolvedCompositionComponentInfo
>();
const componentResolutionListeners = new Set<() => void>();

const getComponentResolutionCacheKey = ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string;
	compositionId: string;
}) => {
	return `${compositionFile}::${compositionId}`;
};

const notifyComponentResolutionListeners = () => {
	for (const listener of componentResolutionListeners) {
		listener();
	}
};

export const subscribeToCompositionComponentInfo = (listener: () => void) => {
	componentResolutionListeners.add(listener);

	return () => {
		componentResolutionListeners.delete(listener);
	};
};

export const getCachedCompositionComponentInfo = ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string;
	compositionId: string;
}) => {
	return (
		componentResolutionResults.get(
			getComponentResolutionCacheKey({compositionFile, compositionId}),
		) ?? null
	);
};

export const useCachedCompositionComponentInfo = ({
	compositionFile,
	compositionId,
}: {
	compositionFile: string | null;
	compositionId: string | null;
}) => {
	const result = useSyncExternalStore(
		subscribeToCompositionComponentInfo,
		() => {
			if (compositionFile === null || compositionId === null) {
				return null;
			}

			return getCachedCompositionComponentInfo({
				compositionFile,
				compositionId,
			});
		},
		() => null,
	);

	useEffect(() => {
		if (
			!getBrowserStudioServer()?.capabilities.insertSolid ||
			compositionFile === null ||
			compositionId === null
		) {
			return;
		}

		preloadCompositionComponentInfo({
			compositionFile,
			compositionId,
		});
	}, [compositionFile, compositionId]);

	return result;
};

export const loadCompositionComponentInfo = async ({
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

		const result = {
			location: body.location,
			canAddSequence: body.canAddSequence,
		};
		componentResolutionResults.set(cacheKey, result);
		notifyComponentResolutionListeners();

		return result;
	})();
	componentResolutionCache.set(cacheKey, promise);

	try {
		return await promise;
	} catch (err) {
		componentResolutionCache.delete(cacheKey);
		componentResolutionResults.delete(cacheKey);
		notifyComponentResolutionListeners();
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

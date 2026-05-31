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

type ResolvedCompositionComponentLocation = {
	source: string;
	line: number;
	column: number;
};

type ResolveCompositionComponentResponse =
	| {
			success: true;
			location: ResolvedCompositionComponentLocation;
			canAddSequence: boolean;
	  }
	| {
			success: false;
			error: string;
	  };

type ResolvedCompositionComponentInfo = {
	location: ResolvedCompositionComponentLocation;
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
		const response = await fetch(`/api/composition-component-info`, {
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

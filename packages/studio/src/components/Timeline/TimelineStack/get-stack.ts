import {
	sourceContentFor,
	TraceMap,
	type SourceMapInput,
} from '@jridgewell/trace-mapping';
import {Internals} from 'remotion';
import {getOriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {
	getLocationOfFunctionCall,
	getLocationOfSequence,
} from '../../../helpers/get-location-of-sequence';
import {hasSourceOnlyRemappings} from '../../../helpers/sequence-node-path-mutations';

const traceMapCache: Partial<Record<string, TraceMap>> = {};
const traceMapPromises: Partial<Record<string, Promise<TraceMap>>> = {};
const traceMapsByOriginalSource = new Map<string, TraceMap>();
const sourceMapFilesCache = new WeakMap<TraceMap, Record<string, string>>();

export const compiledSourceFrame =
	'\n    at remotionCompiledSource (remotion-source-sha256:';

export const getSequenceLocationStack = (
	stack: string | null,
): string | null => {
	const index = stack?.lastIndexOf(compiledSourceFrame) ?? -1;
	if (!stack || index === -1) {
		return stack;
	}

	const source = Internals.parseOriginalSourceStack(stack);
	return source && !hasSourceOnlyRemappings(source.fileName)
		? stack.slice(0, index)
		: stack;
};

export const getCompiledSourceHash = (
	stack: string | null,
	fileName: string,
): string | null => {
	const originalSource = Internals.parseOriginalSourceStack(stack);
	if (originalSource) {
		return originalSource.fileName === fileName
			? (stack?.match(
					/\n {4}at remotionCompiledSource \(remotion-source-sha256:([a-f0-9]{64})\)$/,
				)?.[1] ?? null)
			: null;
	}

	const location = getLocationOfSequence(stack);
	const map = location ? traceMapCache[location.fileName] : null;
	if (!map) {
		return null;
	}

	return (
		sourceContentFor(map, fileName)
			?.slice(-96)
			.match(/\/\* remotion-source-sha256:([a-f0-9]{64}) \*\/\s*$/)?.[1] ?? null
	);
};

const isInternalSource = (source: string | null): boolean => {
	if (source === null) {
		return false;
	}

	const normalizedSource = source.replaceAll('\\', '/');
	// Generated and Remotion runtime files are not authored sequence locations.
	return (
		/(?:^|\/)node_modules\//.test(normalizedSource) ||
		/(?:^|\/)dist\/(?:[^/]+\/)*[^/]+\.(?:cjs|mjs|js)$/.test(normalizedSource) ||
		/(?:^|\/)(?:packages\/)?core\/src\//.test(normalizedSource)
	);
};

const getSourceMapCache = (fileName: string): Promise<TraceMap> => {
	if (traceMapCache[fileName]) {
		return Promise.resolve(traceMapCache[fileName]);
	}

	if (traceMapPromises[fileName]) {
		return traceMapPromises[fileName];
	}

	traceMapPromises[fileName] = fetch(`${fileName}.map`)
		.then((res) => res.json())
		.then((json) => {
			const map = new TraceMap(json as SourceMapInput);
			traceMapCache[fileName] = map;
			for (let index = 0; index < map.sources.length; index++) {
				const source = map.sources[index];
				const content = map.sourcesContent?.[index];
				if (source !== null && typeof content === 'string') {
					traceMapsByOriginalSource.set(source, map);
				}
			}

			return map;
		})
		.finally(() => {
			delete traceMapPromises[fileName];
		});

	return traceMapPromises[fileName];
};

export const getSourceMapFilesForSource = (
	source: string,
): Record<string, string> | null => {
	const map = traceMapsByOriginalSource.get(source);
	if (!map) {
		return null;
	}

	const cached = sourceMapFilesCache.get(map);
	if (cached) {
		return cached;
	}

	const files: Record<string, string> = {};
	for (let index = 0; index < map.sources.length; index++) {
		const fileName = map.sources[index];
		const content = map.sourcesContent?.[index];
		if (fileName !== null && typeof content === 'string') {
			files[fileName] = content;
		}
	}

	sourceMapFilesCache.set(map, files);
	return files;
};

export const getOriginalLocationFromStack = async (
	stack: string,
	type: 'sequence' | 'visual-control',
) => {
	const location =
		type === 'sequence'
			? getLocationOfSequence(stack)
			: getLocationOfFunctionCall(stack, 'visualControl');

	if (!location) {
		return null;
	}

	// Bundlers that record the JSX source location skip symbolication.
	const originalSource = Internals.parseOriginalSourceStack(stack);
	if (originalSource) {
		if (isInternalSource(originalSource.fileName)) {
			return null;
		}

		return {
			column: originalSource.column,
			line: originalSource.line,
			source: originalSource.fileName,
		};
	}

	const map = await getSourceMapCache(location.fileName);
	const originalPosition = getOriginalPosition(
		map,
		location.lineNumber as number,
		location.columnNumber as number,
	);
	return isInternalSource(originalPosition.source) ? null : originalPosition;
};

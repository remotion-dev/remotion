import {TraceMap, type SourceMapInput} from '@jridgewell/trace-mapping';
import {getOriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {
	getLocationOfFunctionCall,
	getLocationOfSequence,
} from '../../../helpers/get-location-of-sequence';

const traceMapCache: Partial<Record<string, TraceMap>> = {};
const traceMapPromises: Partial<Record<string, Promise<TraceMap>>> = {};
const traceMapsByOriginalSource = new Map<string, TraceMap>();
const sourceMapFilesCache = new WeakMap<TraceMap, Record<string, string>>();
const browserStudioOriginalSourcePrefix = 'browser-studio-original://';
const studioOriginalSourcePrefix = 'studio-original://';

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

	const originalSourcePrefix = [
		browserStudioOriginalSourcePrefix,
		studioOriginalSourcePrefix,
	].find((prefix) => location.fileName.startsWith(prefix));

	if (originalSourcePrefix) {
		return {
			column: location.columnNumber,
			line: location.lineNumber,
			source: decodeURIComponent(
				location.fileName.slice(originalSourcePrefix.length),
			),
		};
	}

	const map = await getSourceMapCache(location.fileName);
	const originalPosition = getOriginalPosition(
		map,
		location.lineNumber as number,
		location.columnNumber as number,
	);
	return originalPosition;
};

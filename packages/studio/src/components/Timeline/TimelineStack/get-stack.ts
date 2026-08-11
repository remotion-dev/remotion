import {TraceMap, type SourceMapInput} from '@jridgewell/trace-mapping';
import {getOriginalPosition} from '../../../error-overlay/react-overlay/utils/get-source-map';
import {
	getLocationOfFunctionCall,
	getLocationOfSequence,
} from '../../../helpers/get-location-of-sequence';

const traceMapCache: Partial<Record<string, TraceMap>> = {};
const traceMapPromises: Partial<Record<string, Promise<TraceMap>>> = {};
const browserStudioOriginalSourcePrefix = 'browser-studio-original://';
const studioOriginalSourcePrefix = 'studio-original://';

const getSourceMapCache = async (fileName: string) => {
	if (traceMapCache[fileName]) {
		return traceMapCache[fileName];
	}

	if (traceMapPromises[fileName]) {
		return traceMapPromises[fileName];
	}

	traceMapPromises[fileName] = fetch(`${fileName}.map`)
		.then((res) => res.json())
		.then((json) => {
			const map = new TraceMap(json as SourceMapInput);
			traceMapCache[fileName] = map;
			return map;
		})
		.finally(() => {
			delete traceMapPromises[fileName];
		});

	return traceMapPromises[fileName];
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

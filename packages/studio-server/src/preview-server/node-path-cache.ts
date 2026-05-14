import type {SequenceNodePath} from 'remotion';

// Cache mapping source-mapped locations to resolved AST node paths.
//
// Problem: When the studio modifies a file (e.g. updating sequence props),
// we suppress the webpack rebuild so the source map becomes stale.
// If prettier then reformats the file, tags can shift lines:
//
//   Before (source map says line 22):
//     export const Component = () => {
//       return <Video src={src} />;      // line 22
//     };
//
//   After adding style={{}} + prettier wrapping:
//     export const Component = () => {
//       return (
//         <Video src={src} style={{}} />  // now line 23
//       );
//     };
//
// On reload, the stale source map still resolves to line 22, but the
// actual file now has the <Video> tag on line 23. Without caching,
// lineColumnToNodePath(ast, 22) fails to find the tag.
//
// Solution: After a successful line→nodePath resolution, we cache the
// mapping. On subsequent requests with the same stale coordinates, the
// cached nodePath is used directly (verified against the current AST).
// The cache is cleared when webpack rebuilds (compiler.hooks.done),
// at which point source maps are fresh and line-based lookup works again.

type CacheKey = string;

const makeCacheKey = (
	fileName: string,
	line: number,
	column: number,
): CacheKey => {
	return `${fileName}:${line}:${column}`;
};

const cache = new Map<CacheKey, SequenceNodePath>();

export const getCachedNodePath = (
	fileName: string,
	line: number,
	column: number,
): SequenceNodePath | undefined => {
	return cache.get(makeCacheKey(fileName, line, column));
};

export const setCachedNodePath = (
	fileName: string,
	line: number,
	column: number,
	nodePath: SequenceNodePath,
): void => {
	cache.set(makeCacheKey(fileName, line, column), nodePath);
};

export const clearNodePathCache = (): void => {
	cache.clear();
};

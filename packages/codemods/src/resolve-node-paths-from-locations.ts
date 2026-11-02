import * as recast from 'recast';
import type {SequenceNodePath} from 'remotion';
import {recastLocToOffset} from './recast-loc-to-offset';
import {getNodePathForRecastPath} from './sequence-props';
import {getReadOnlySourceSnapshot} from './sequence-props-snapshot';

export const resolveNodePathsFromLocations = ({
	fileContents,
	targets,
}: {
	fileContents: string;
	targets: {line: number; column: number}[];
}): (SequenceNodePath | null)[] => {
	const {ast} = getReadOnlySourceSnapshot(fileContents);
	const matchesByLine = new Map<
		number,
		{
			lastNodePath: SequenceNodePath | null;
			byColumn: Map<number, {nodePath: SequenceNodePath; count: number}>;
		}
	>();
	for (const {line} of targets) {
		if (!matchesByLine.has(line)) {
			matchesByLine.set(line, {lastNodePath: null, byColumn: new Map()});
		}
	}

	// Recast normalizes whitespace and line endings. Convert its locations back
	// to source columns without splitting the entire source prefix for each node.
	const lineStarts = [0];
	for (const match of fileContents.matchAll(/\r\n|[\r\n\u2028\u2029]/g)) {
		lineStarts.push(match.index + match[0].length);
	}

	recast.visit(ast, {
		visitJSXOpeningElement(p) {
			const location = p.node.loc?.start;
			const matches = location ? matchesByLine.get(location.line) : undefined;
			if (location && matches) {
				const nodePath = getNodePathForRecastPath(p, ast);
				const column =
					recastLocToOffset(fileContents, location) -
					lineStarts[location.line - 1];
				const previous = matches.byColumn.get(column);
				matches.lastNodePath = nodePath;
				matches.byColumn.set(column, {
					nodePath,
					count: (previous?.count ?? 0) + 1,
				});
			}

			return this.traverse(p);
		},
	});

	return targets.map(({line, column}) => {
		const matches = matchesByLine.get(line)!;
		const exact = matches.byColumn.get(column);
		// Preserve the last JSX element on the line as the fallback for stale
		// source-map columns, including when a column match is ambiguous.
		return exact?.count === 1 ? exact.nodePath : matches.lastNodePath;
	});
};

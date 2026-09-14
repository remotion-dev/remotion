import type {SimpleDiff} from '@remotion/studio-shared';

const countUniqueLineChanges = ({from, to}: {from: string[]; to: string[]}) => {
	const linesChecked = new Set<string>();
	let total = 0;
	for (const line of from) {
		if (linesChecked.has(line)) {
			continue;
		}

		total += Math.max(
			0,
			from.filter((candidate) => candidate === line).length -
				to.filter((candidate) => candidate === line).length,
		);
		linesChecked.add(line);
	}

	return total;
};

export const simpleDiff = ({
	oldLines,
	newLines,
}: {
	oldLines: string[];
	newLines: string[];
}): SimpleDiff => ({
	additions: countUniqueLineChanges({from: newLines, to: oldLines}),
	deletions: countUniqueLineChanges({from: oldLines, to: newLines}),
});

import type {SimpleDiff} from '@remotion/studio-shared';

const findDeletions = ({
	oldLines,
	newLines,
}: {
	oldLines: string[];
	newLines: string[];
}) => {
	const linesChecked: string[] = [];
	let totalDeletions = 0;
	for (const line of oldLines) {
		if (linesChecked.includes(line)) {
			continue;
		}

		const timesInNewLines = newLines.filter((l) => l === line).length;
		const timesInOldLines = oldLines.filter((l) => l === line).length;
		const deletions = Math.max(0, timesInOldLines - timesInNewLines);
		totalDeletions += deletions;
		linesChecked.push(line);
	}

	return totalDeletions;
};

const findAdditions = ({
	oldLines,
	newLines,
}: {
	oldLines: string[];
	newLines: string[];
}) => {
	const linesChecked: string[] = [];
	let totalAdditions = 0;
	for (const line of newLines) {
		if (linesChecked.includes(line)) {
			continue;
		}

		const timesInNewLines = newLines.filter((l) => l === line).length;
		const timesInOldLines = oldLines.filter((l) => l === line).length;
		const additions = Math.max(0, timesInNewLines - timesInOldLines);
		totalAdditions += additions;
		linesChecked.push(line);
	}

	return totalAdditions;
};

export const simpleDiff = ({
	oldLines,
	newLines,
}: {
	oldLines: string[];
	newLines: string[];
}): SimpleDiff => {
	const deletions = findDeletions({oldLines, newLines});
	const additions = findAdditions({oldLines, newLines});

	return {deletions, additions};
};

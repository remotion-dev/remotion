import type {_InternalTypes} from 'remotion';
import type {CompositionSelectorItemType} from '../CompositionSelectorItem';

export type CompositionSearchResult =
	| {
			readonly type: 'folder';
			readonly id: string;
			readonly title: string;
			readonly level: number;
	  }
	| {
			readonly type: 'composition';
			readonly composition: _InternalTypes['AnyComposition'];
			readonly level: number;
	  };

type RankedCompositionSearchResult =
	| {
			readonly type: 'folder';
			readonly id: string;
			readonly title: string;
			readonly level: number;
			readonly score: number;
			readonly children: RankedCompositionSearchResult[];
	  }
	| {
			readonly type: 'composition';
			readonly composition: _InternalTypes['AnyComposition'];
			readonly level: number;
			readonly score: number;
	  };

const normalizeSearchText = (text: string) => {
	return text
		.trim()
		.toLowerCase()
		.replace(/[\s/-]/g, '');
};

const getMatchScore = (query: string, candidate: string): number | null => {
	const normalizedCandidate = normalizeSearchText(candidate);
	if (normalizedCandidate === query) {
		return 400_000 - normalizedCandidate.length;
	}

	if (normalizedCandidate.startsWith(query)) {
		return 300_000 - (normalizedCandidate.length - query.length);
	}

	const substringIndex = normalizedCandidate.indexOf(query);
	if (substringIndex !== -1) {
		return (
			200_000 -
			substringIndex * 100 -
			(normalizedCandidate.length - query.length)
		);
	}

	let previousIndex = -1;
	let firstIndex = -1;
	let gapCount = 0;
	for (const character of query) {
		const nextIndex = normalizedCandidate.indexOf(character, previousIndex + 1);
		if (nextIndex === -1) {
			return null;
		}

		if (firstIndex === -1) {
			firstIndex = nextIndex;
		} else {
			gapCount += nextIndex - previousIndex - 1;
		}

		previousIndex = nextIndex;
	}

	return (
		100_000 -
		gapCount * 100 -
		firstIndex * 10 -
		(normalizedCandidate.length - query.length)
	);
};

export const searchCompositionTree = ({
	items,
	query,
}: {
	readonly items: CompositionSelectorItemType[];
	readonly query: string;
}): CompositionSearchResult[] => {
	const normalizedQuery = normalizeSearchText(query);

	const filterAndRank = (
		treeItems: CompositionSelectorItemType[],
		level: number,
		inheritedFolderScore: number | null,
	): RankedCompositionSearchResult[] => {
		const rankedItems = treeItems
			.map((item, originalIndex) => {
				if (item.type === 'composition') {
					const compositionPath = [
						item.composition.parentFolderName,
						item.composition.folderName,
						item.composition.id,
					]
						.filter(Boolean)
						.join('/');
					const idScore =
						normalizedQuery === ''
							? 0
							: getMatchScore(normalizedQuery, item.composition.id);
					const compositionPathScore =
						normalizedQuery === ''
							? 0
							: getMatchScore(normalizedQuery, compositionPath);
					const directScore = Math.max(
						idScore ?? -1,
						compositionPathScore ?? -1,
					);
					const score = Math.max(directScore, inheritedFolderScore ?? -1);
					if (score === -1) {
						return null;
					}

					return {
						result: {
							type: 'composition' as const,
							composition: item.composition,
							level,
							score,
						},
						originalIndex,
					};
				}

				const fullPath = [item.parentName, item.folderName]
					.filter(Boolean)
					.join('/');
				const nameScore =
					normalizedQuery === ''
						? 0
						: getMatchScore(normalizedQuery, item.folderName);
				const pathScore =
					normalizedQuery === '' ? 0 : getMatchScore(normalizedQuery, fullPath);
				const directFolderScore = Math.max(nameScore ?? -1, pathScore ?? -1);
				const folderScore = Math.max(
					directFolderScore === -1 ? -1 : directFolderScore - 1,
					inheritedFolderScore ?? -1,
				);
				const children = filterAndRank(
					item.items,
					level + 1,
					folderScore === -1 ? null : folderScore,
				);
				if (children.length === 0) {
					return null;
				}

				return {
					result: {
						type: 'folder' as const,
						id: `folder-${fullPath}`,
						title: item.folderName,
						level,
						score: Math.max(
							folderScore,
							...children.map((child) => child.score),
						),
						children,
					},
					originalIndex,
				};
			})
			.filter((item) => item !== null);

		if (normalizedQuery !== '') {
			rankedItems.sort((a, b) => {
				return (
					b.result.score - a.result.score || a.originalIndex - b.originalIndex
				);
			});
		}

		return rankedItems.map((item) => item.result);
	};

	const flatten = (
		rankedItems: RankedCompositionSearchResult[],
	): CompositionSearchResult[] => {
		return rankedItems.flatMap((item): CompositionSearchResult[] => {
			if (item.type === 'composition') {
				return [
					{
						type: 'composition',
						composition: item.composition,
						level: item.level,
					},
				];
			}

			return [
				{
					type: 'folder',
					id: item.id,
					title: item.title,
					level: item.level,
				},
				...flatten(item.children),
			];
		});
	};

	return flatten(filterAndRank(items, 0, null));
};

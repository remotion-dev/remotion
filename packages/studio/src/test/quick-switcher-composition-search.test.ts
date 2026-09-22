import {expect, test} from 'bun:test';
import type {_InternalTypes} from 'remotion';
import type {CompositionSelectorItemType} from '../components/CompositionSelectorItem';
import {searchCompositionTree} from '../components/QuickSwitcher/composition-search';

const composition = (
	id: string,
	folderName: string | null,
	parentFolderName: string | null,
): CompositionSelectorItemType => {
	return {
		type: 'composition',
		key: id,
		composition: {
			id,
			folderName,
			parentFolderName,
		} as _InternalTypes['AnyComposition'],
	};
};

const tree: CompositionSelectorItemType[] = [
	{
		type: 'folder',
		key: 'marketing',
		folder: {} as _InternalTypes['TFolder'],
		folderName: 'Marketing',
		parentName: null,
		expanded: false,
		items: [
			composition('LaunchTrailer', 'Marketing', null),
			composition('Credits', 'Marketing', null),
			{
				type: 'folder',
				key: 'social',
				folder: {} as _InternalTypes['TFolder'],
				folderName: 'Social',
				parentName: 'Marketing',
				expanded: false,
				items: [composition('SquareCut', 'Social', 'Marketing')],
			},
		],
	},
	composition('LaunchOverview', null, null),
];

const summarize = (query: string) => {
	return searchCompositionTree({items: tree, query}).map((result) => {
		return result.type === 'folder'
			? `folder:${result.level}:${result.title}`
			: `composition:${result.level}:${result.composition.id}`;
	});
};

test('searches compositions as a ranked, pruned folder tree', () => {
	expect(summarize('LaunchTrailer')).toEqual([
		'folder:0:Marketing',
		'composition:1:LaunchTrailer',
	]);

	expect(summarize('Marketing')).toEqual([
		'folder:0:Marketing',
		'composition:1:LaunchTrailer',
		'composition:1:Credits',
		'folder:1:Social',
		'composition:2:SquareCut',
	]);

	expect(summarize('Launch')).toEqual([
		'folder:0:Marketing',
		'composition:1:LaunchTrailer',
		'composition:0:LaunchOverview',
	]);

	expect(summarize('Marketing Square')).toEqual([
		'folder:0:Marketing',
		'folder:1:Social',
		'composition:2:SquareCut',
	]);
});

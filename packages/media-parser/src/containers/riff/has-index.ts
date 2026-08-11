import type {ListBox, RiffStructure} from './riff-box';

export const riffHasIndex = (structure: RiffStructure) => {
	return (
		(
			structure.boxes.find(
				(b) => b.type === 'list-box' && b.listType === 'hdrl',
			) as ListBox | undefined
		)?.children.find((box) => box.type === 'avih-box')?.hasIndex ?? false
	);
};

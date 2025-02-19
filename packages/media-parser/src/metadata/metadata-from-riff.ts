import type {ListBox, RiffStructure} from '../containers/riff/riff-box';
import {truthy} from '../truthy';
import type {MetadataEntry} from './get-metadata';

export const getMetadataFromRiff = (
	structure: RiffStructure,
): MetadataEntry[] => {
	const boxes = structure.boxes.find(
		(b) => b.type === 'list-box' && b.listType === 'INFO',
	) as ListBox | undefined;
	if (!boxes) {
		return [];
	}

	const {children} = boxes;

	return children
		.map((child) => {
			if (child.type !== 'isft-box') {
				return null;
			}

			return {
				trackId: null,
				key: 'encoder',
				value: child.software,
			};
		})
		.filter(truthy);
};
